'use strict';
const stripe = require('stripe')(process.env.STRIPE_KEY);
const db = require('../models');
const { isUndefinedOrNullOrEmpty } = require('../helpers');
const Order = db.Order;
const OrderProduct = db.OrderProduct;
const Product = db.Product;
const Cart = db.Cart;
const CartItem = db.CartItem;

exports.addOrder = async(req, res, next) => {
    try{
        const sumQuery = await Cart.findAll({
            attributes: [[db.sequelize.literal('SUM(price * amount)'), 'total']],
            // attributes: ['id', 'userId'],
            include: [{
                model: CartItem,
                attributes: [],
                // attributes: ['amount'],
                include: [{
                    model: Product,
                    attributes: []
                    // attributes: ['price']
                }]
            }],
            where: {
                userId: res.locals.userId
            },
            raw: true
        });
        const sumAmount = sumQuery[0];
        const paymentIntent = await stripe.paymentIntents.create({
            amount: sumAmount.total * 100,
            currency: 'usd'
        });
        const order = await Order.create({
            userId: res.locals.userId,
            total: sumAmount.total,
            stripePaymentId: paymentIntent.id
        });
        const cartItems = await Cart.findAll({
            attributes: [
                [db.Sequelize.col('CartItems.amount'), 'amount'],
                [db.Sequelize.col('CartItems.productId'), 'productId'],

            ],
            include: [{
                model: CartItem,
                attributes: []
            }],
            where: {
                userId: res.locals.userId
            },
            raw: true
        });
        const products = cartItems.map(c => ({
            ...c,
            orderId: order.id
        }));
        OrderProduct.bulkCreate(products);
        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            order
        })
    }catch(e){
        console.log(e)
        res.locals.errOperation = 'db';
        next(e);
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

        //clear cart
        await db.sequelize.query('DELETE FROM CartItems WHERE cartId = (SELECT id FROM Carts WHERE userId = ?)', {
            replacements: [res.locals.userId],
            type: db.sequelize.QueryTypes.SELECT
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