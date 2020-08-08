'use strict';
const stripe = require('stripe')(process.env.STRIPE_KEY);
const db = require('../models');
const { isUndefinedOrNullOrEmpty } = require('../helpers');
const Order = db.Order;
const OrderProduct = db.OrderProduct;
const Product = db.Product;

exports.addOrder = async(req, res, next) => {
    const products = req.body.products;
    try{
        const sumAmount = await Product.findAll({
            // attributes: ['price'],
            attributes: [
                [db.sequelize.fn('sum', db.sequelize.col('price')), 'total']
            ],
            where: {
                id: products
            },
            raw: true
        });
        const total = sumAmount[0];
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total.total * 100,
            currency: 'usd'
        });
        const order = await Order.create({
            userId: res.locals.userId,
            total: total.total,
            stripePaymentId: paymentIntent.id
        });
        const orderProductData = []
        products.forEach((product) => {
            orderProductData.push({orderStatus: 'Processing', OrderId: order.id, ProductId: product})
        });
        const orderProducts = await OrderProduct.bulkCreate(orderProductData);
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            order
        })
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Unable to create this order at this time.'
        })
    }
}

exports.getOrder = async(req, res, next) => {
    try{
        // const order = await Order.findByPk(req.params.id);
        const adminRoles = ['SuperAdmin', 'Admin'];
        let order = null;
        if(adminRoles.includes(res.locals.userRole)){
            order = await Order.findOne({
                where: {
                    id: req.params.id
                },
                include: OrderProduct
            });
        }else{
            order = await Order.findOne({
                where: {
                    id: req.params.id,
                    userId: res.locals.userId
                },
                include: [Product]
            });
        }
        return res.status(200).json({
            statusMessage: 'Order returned.',
            order
        })
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError', 
            statusMessage: 'Unable to find order.'
        });
    }
}

exports.getOrders = async(req, res, next) => {
    const userRole = res.locals.userRole;
    const adminRoles = ['SuperAdmin', 'Admin'];
    let userId = null;
    if (isUndefinedOrNullOrEmpty(req.params.userId)){
        userId = res.locals.userId;
    }
    else if(adminRoles.includes(userRole)){
        userId = req.params.id
    }
    try{
        const orders = await Order.findAll({
            where: {
                userId: userId
            }
        });
        return res.status(200).json({
            statusMessage: 'Orders retrieved.',
            orders
        })
    }catch(e){
        return res.status(500).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to retrieve orders at this time or the user does not exist.'
        });
    }
}

exports.orderProcessed = async(req, res) => {
    const event = req.body.type;
    const paymentIntent = req.body.data.object;
    if (event === 'payment_intent.succeeded'){
        //the payment was successful, update the order product statuses
        const order = await Order.findOne({
            where: {
                stripePaymentId: paymentIntent.id
            }
        });
        //update order products to fullfilling status now that payment was successful
        await OrderProduct.update({
            orderStatus: 'Fulfilling'
        },
        {
            where: {
                orderId: order.id
            }
        });
        return res.status(200).json({received: true});
    }else{
        return res.status(400).json({received: false});
    }
}