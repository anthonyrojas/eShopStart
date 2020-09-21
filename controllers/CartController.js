'use strict';
const db = require('../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Product = db.Product;

exports.addCart = async(req, res, next) => {
    try{
        let cart = await Cart.findOne({
            where: {
                userId: res.local.userId
            }
        });
        if (!cart){
            cart = await Cart.create({
                userId: res.locals.userId
            });
        }
        return res.status(200).json({
            cart,
            statusMessage: 'Cart created.'
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.addCartItem = async(req, res, next) => {
    try{
        let cart = await Cart.findOne({
            where: {
                userId: res.locals.userId
            },
            raw: true
        });
        if (!cart){
            cart = await Cart.create({
                userId: res.locals.userId
            });
        }
        await cart.addCartItem(req.body.cartItem);
        return res.status(200).json({
            statusMessage: 'Item added to cart.'
        })
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updateCartItems = async(req, res, next) => {
    try{
        let cart = await Cart.findOne({
            where: {
                userId: res.locals.userId
            },
            raw: true
        });
        if (!cart){
            cart = await Cart.create({
                userId: res.locals.userId
            });
        }
        await CartItem.destroy({
            where: {
                cartId: cart.id
            }
        });
        // await cart.removeCartItems();
        // await cart.addCartItems(req.body.cart);
        const reqCart = req.body.cart;
        const cartItems = reqCart.map(c => ({
            ...c,
            cartId: cart.id
        }));
        await CartItem.bulkCreate(cartItems);
        return res.status(200).json({
            statusMessage: 'Cart items updated.'
        });
    }catch(e){
        console.log(e);
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.clearCart = async(req, res, next) => {
    try{
        let cart = await Cart.findOne({
            where: {
                userId: res.locals.userId
            }
        });
        if(!cart){
            cart = await Cart.create({
                userId: res.locals.userId
            });
        }
        await CartItem.destroy({
            where: {
                cartId: cart.id
            }
        })
        return res.status(200).json({
            statusMessage: 'Cart cleared.',
            cart: []
        })
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}
exports.getCart = async(req, res, next) => {
    try{
        let cart = await Cart.findOne({
            where: {
                userId: res.locals.userId
            }
        });
        //there is no cart for this user, create one
        if(!cart){
            //create a cart
            cart = await Cart.create({
                userId: res.locals.userId
            });
            //return an empty cart
            return res.status(200).json({
                statusMessage: 'Cart returned.',
                cart: []
            });
        }
        const cartItems = await Cart.getCartItems();
        return res.status(200).json({
            statusMessage: 'Cart returned.',
            cart,
            cartItems
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.calculateSubTotal = async(req, res, next) => {
    try{
        //calculate the subtotal of the cart
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
        res.locals.subTotal = sumQuery[0];
        next();
    }catch(e){
        next(e);
    }
}

exports.getCartSubtotal = async(req, res, next) => {
    try{
        const cart = await Cart.findOne({
            where: {
                userId: res.locals.userId,
            },
            include: [{
                model: CartItem,
                include: Product
            }]
        });
        return res.status(200).json({
            statusMessage: 'Cart items and subtotal retrieved.',
            cart,
            subTotal: res.locals.subTotal
        });
    }catch(e){
        next(e);
    }
}

exports.calculatePackageDimensions = async(req, res, next) => {
    try{
        const sumQuery = await Cart.findAll({
            attributes: [
                [db.sequelize.literal('SUM(weight*amount)'), 'totalWeight'],
                [db.sequelize.literal('SUM(height*amount)'), 'totalHeight'],
                [db.sequelize.fn('max', db.sequelize.col('width')), 'maxWidth'],
                [db.sequelize.fn('max', db.sequelize.col('length')), 'maxLength']
            ],
            include: [{
                model: CartItem,
                attributes: [],
                include: [{
                    model: Product,
                    attributes: [],
                    where: {
                        isDeliverable: true
                    }
                }]
            }],
            raw: true
        });
        res.locals.packageDimensions = sumQuery[0];
        next();
    }catch(e){
        next(e);
    }
}