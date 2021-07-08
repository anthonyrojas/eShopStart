'use strict';
const jwt = require('jsonwebtoken');
const db = require('../models');
const OrderProduct = db.OrderProduct;
const Product = db.Product;

exports.updateOrderProduct = async(req, res) => {
    const allowedRoles = ['SuperAdmin', 'Admin'];
    //update the order product
    try{
        if(allowedRoles.includes(res.locals.role)){
            const orderProduct = await OrderProduct.findOne({
                where: {
                    id: req.params.id
                },
                raw: true
            });
            orderProduct.orderStatus = req.body.orderStatus;
            await orderProduct.save();
            return res.status(200).json({
                statusMessage: 'Updated order product status',
                orderProduct
            });
        }else{
            throw Error('You do not have permissions to update the order product');
        }
    }catch(e){
        next(e);
    }
}

exports.requestDigitalProductAccess = async(req, res, next) => {
    try{
        // const urlLength = req.baseUrl.split('/').length;
        // if(req.baseUrl.split('/')[urlLength-1] !== 'token'){
        //     //the user is not requesting a token, redirect to the download
        // }
        //req.params.orderId
        //req.params.productId
        const orderProduct = await OrderProduct.findOne({
            where: {
                userId: res.locals.userId,
                orderId: req.params.orderId,
                productId: req.params.id,
                downloadsRemaining: {
                    [db.sequelize.Op.gt]: 0
                }
            },
            // include: Product,
            raw: true
        });
        if(!orderProduct){
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You have met the number of allowed downloads for this item or this product was not part of this purchase.'
            });
        }
        const tokenPromise = new Promise((resolve, reject) => {
            jwt.sign({
                productId: orderProduct.productId,
                orderId: orderProduct.orderId
            }, 
            orderProduct.accessTokenSecret,
            {
                algorithm: 'HS256'
            },
            (err, token) => {
                if(err) reject(err);
                else resolve(token)
            })
        });
        const token = await tokenPromise;
        return res.status(200).json({
            statusMessage: 'Digital product access token returned.',
            token,
            orderId: orderProduct.orderId,
            productId: orderProduct.productId
        });
    }catch(e){
        next(e);
    }
}