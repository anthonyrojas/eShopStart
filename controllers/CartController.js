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
        if(!cart){
            cart = await Cart.create({
                userId: res.locals.userId
            });
            return res.status(200).json({
                statusMessage: 'Cart returned.',
                cart: []
            });
        }
        const cartItems = await Cart.getCartItems();
        return res.status(200).json({
            statusMessage: 'Cart returned.',
            cart: cartItems
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}