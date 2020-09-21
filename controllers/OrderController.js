'use strict';
const stripe = require('stripe')(process.env.STRIPE_KEY);
const shippo = require('shippo')(process.env.SHIPPO_KEY);
const db = require('../models');
const { isUndefinedOrNullOrEmpty } = require('../helpers');
const User = db.User;
const Order = db.Order;
const OrderProduct = db.OrderProduct;
const Product = db.Product;
const Cart = db.Cart;
const CartItem = db.CartItem;
const Shipment = db.Shipment;
const AppSetting = db.AppSetting;
const MailUtils = require('../utils/Mail');

exports.beginCheckout = async(req, res, next) => {
    try{
        //subtotal of the cart
        const sumAmount = res.locals.subTotal;
        //check if an order object already exists
        let order = await Order.findOne({
            where: {
                userId: res.locals.userId,
                paymentStatus: 'initiated'
            },
            raw: true
        });
        if(order){
            //update the total with the new subtotal
            order.total = sumAmount;
            await order.save();
            //delete current order products
            await OrderProduct.destroy({
                where: {
                    orderId: currentOrder.id
                }
            });
        }else{
            //create a new order
            order = await Order.create({
                total: sumAmount,
                paymentStatus: 'initiated',
                userId: res.locals.userId
            });
            //create associated order products
            const cartItems = await Cart.findAll({
                attributes: [
                    [db.Sequelize.col('CartItems.amount'), 'amount'],
                    [db.Sequelize.col('CartItems.productId'), 'productId']
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
            const orderProducts = cartItems.map(c => ({
                ...c,
                orderId: order.id
            }));
            OrderProduct.bulkCreate(orderProducts);
        }
        res.locals.order = order;
        next();
    }catch(e){
        next(e);
    }
}

exports.completeCheckout = async(req, res, next) => {
    try{
        //check if the order is an existing order with a stripe payment id
        const order = res.locals.order;
        let paymentIntent = null;
        if(order.stripePaymentId){
            paymentIntent = await stripe.paymentIntents.confirm(order.stripePaymentId, {
                amount: order.total * 100,
                currency: 'usd'
            });
        }else{
            paymentIntent = await stripe.paymentIntents.create({
                amount: order.total * 100,
                currency: 'usd'
            });
            order.stripePaymentId = paymentIntent.id;
        }
        //update the order with final total and stripe id
        await order.save();
        return res.status(200).json({
            statusMessage: 'Checkout successful.',
            clientSecret: paymentIntent.client_secret,
            order
        });
    }catch(e){
        next(e);
    }
}

exports.addOrder = async(req, res, next) => {
    try{
        //calculate the sum total of the cart
        const sumQuery = await Cart.findAll({
            attributes: [[db.sequelize.literal('SUM(price * amount)'), 'total']],
            include: [{
                model: CartItem,
                attributes: [],
                include: [{
                    model: Product,
                    attributes: []
                }]
            }],
            where: {
                userId: res.locals.userId
            },
            raw: true
        });
        const sumAmount = sumQuery[0];

        let paymentIntent = null;

        //check if there is already an order with a payment intent initatied but not complete for this user
        let order = await Order.findOne({
            where: {
                userId: res.locals.userId,
                paymentStatus: 'initiated'
            },
            raw: true
        });
        //there is an existing order initiated and not completed
        if(order){
            paymentIntent = await stripe.paymentIntents.confirm(currentOrder.stripePaymentId, {
                amount: sumAmount.total * 100,
                currency: 'usd'
            });
            currentOrder.total = sumAmount.total;
            await currentOrder.save();
            await OrderProduct.destroy({
                where: {
                    orderId: currentOrder.id
                }
            });
        }else{
            //create a new payment intent
            paymentIntent = await stripe.paymentIntents.create({
                amount: sumAmount.total * 100,
                currency: 'usd'
            });
            order = await Order.create({
                userId: res.locals.userId,
                total: sumAmount.total,
                stripePaymentId: paymentIntent.id
            });
        }
        const cartItems = await Cart.findAll({
            attributes: [
                [db.Sequelize.col('CartItems.amount'), 'amount'],
                [db.Sequelize.col('CartItems.productId'), 'productId']
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
                include: Product
            });
        }else{
            order = await Order.findOne({
                where: {
                    id: req.params.id,
                    userId: res.locals.userId
                },
                include: Product
            });
        }
        return res.status(200).json({
            statusMessage: 'Order returned.',
            order
        })
    }catch(e){
        console.log(e);
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
        let limit = isUndefinedOrNullOrEmpty(req.query.limit) ? 10 : Number(req.query.limit);
        let skip = isUndefinedOrNullOrEmpty(req.query.skip) ? 0 : Number(req.query.skip);
        const orders = await Order.findAll({
            where: {
                userId: userId
            },
            limit: limit,
            offset: skip
        });
        return res.status(200).json({
            statusMessage: 'Orders retrieved.',
            orders
        });
    }catch(e){
        return res.status(500).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to retrieve orders at this time or the user does not exist.'
        });
    }
}

exports.processOrder = async(req, res) => {
    const sig = request.headers['stripe-signature'];
    //check stripe signature
    if(!sig){
        return res.status(400).json({
            statusMessage: 'Invalid request.'
        })
    }
    let event;
    try{
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        const paymentIntent = req.body.data.object;
        if (event.type === 'payment_intent.succeeded'){
            //the payment was successful, update the order product statuses
            const order = await Order.findOne({
                // attributes: ['id', 'stripePaymentId', 'paymentStatus'],
                where: {
                    stripePaymentId: paymentIntent.id
                },
                include: [Shipment, Product, User]
            });
            order.paymentStatus = 'Completed';
            await order.save();

            const data = order.toJSON();
    
            //clear cart
            await db.sequelize.query('DELETE FROM CartItems WHERE cartId = (SELECT id FROM Carts WHERE userId = ?)', {
                replacements: [res.locals.userId],
                type: db.sequelize.QueryTypes.DELETE
            });
    
            //decrease inventory
            await db.sequelize.query(`UPDATE Inventories INNER JOIN OrderProducts ON OrderProducts.productId = Inventories.productId INNER JOIN Orders ON Orders.id = OrderProducts.orderId SET Inventories.amount = Inventories.amount - OrderProducts.amount WHERE Order.id = ?`, {
                replacements: [data.id],
                type: db.sequelize.QueryTypes.UPDATE
            });

            //purchase shipping if there exists one
            if(order.Shipment){
                const transaction = await shippo.transaction.create({
                    rate: data.Shipment.rateId,
                    label_file_type: "png",
                    async: true
                });
                await Shipment.update({
                    transactionId: transaction.object_id
                }, {
                    where: {
                        id: order.Shipment.id
                    }
                });
            }
    
            //update order products to fullfilling status now that payment was successful
            await OrderProduct.update({
                orderStatus: 'Fulfilling'
            },
            {
                where: {
                    orderId: order.id
                }
            });

            //send an email to the customer using the default template
            await MailUtils.sendOrderEmail(data);
            
            return res.status(200).json({received: true});
        }else{
            return res.status(400).json({received: false});
        }
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: e.message
        })
    }
}