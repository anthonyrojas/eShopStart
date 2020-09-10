'use strict';
const db = require('../models');
const { isUndefinedOrNullOrEmpty } = require('../helpers');
const ShippingAddress = db.ShippingAddress;

exports.addShippingAddress = async(req, res, next) => {
    try{
        const address = await ShippingAddress.create({
            street: req.body.street,
            apt: req.body.apt || null,
            city: req.body.city || null,
            state: req.body.state || null,
            zip: req.body.zip || null,
            userId: res.locals.userId
        });
        return res.status(200).json({
            statusMessage: 'Shipping address added.',
            address
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updateShippingAddress = async(req,res,next) => {
    try{
        const updatedRows = await ShippingAddress.update({
            street: req.body.street,
            apt: req.body.apt,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
        }, {
            where: {
                id: req.params.id,
                userId: res.locals.userId
            }
        });
        if(updatedRows[0]==0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update shipping address because it was not found.'
            });
        }
        const address = await ShippingAddress.findByPk(req.params.id)
        return res.status(200).json({
            statusMessage: 'Shipping address updated.',
            address
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.getShippingAddresses = async(req, res, next) => {
    try{
        const userRole = res.locals.userId;
        const allowedRoles = ['SuperAdmin'];
        let addresses = null;
        if(!isUndefinedOrNullOrEmpty(req.params.userId) && allowedRoles.includes(userRole)){
            addresss = await ShippingAddress.findAll({
                where: {
                    userId: req.params.userId
                }
            });

        }else{
            addresses = await ShippingAddress.findAll({
                where: {
                    userId: res.locals.userId
                }
            });
        }
        return res.status(200).json({
            statusMessage: 'Shipping addresses retrieved.',
            addresses
        });
    }catch(e){
        next(e);
    }
}

exports.getShippingAddress = async(req, res, next) => {
    try{
        const userRole = res.locals.role;
        const allowedRoles = ['SuperAdmin'];
        const shippingAddress = await ShippingAddress.findByPk(req.params.id, {
            raw: true
        });
        if(res.locals.userId === shippingAddress.userId){
            return res.status(200).json({
                statusMessage: 'Shipping address retrieved.',
                shippingAddress
            });
        }else if(allowedRoles.includes(userRole)){
            return res.status(200).json({
                statusMessage: 'Shipping address retrieved.',
                shippingAddress
            });
        }else{
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Shipping address not found.'
            });
        }
    }catch(e){
        next(e);
    }
}

exports.deleteShippingAddress = async(req, res, next) => {
    try{
        const userRole = res.locals.role;
        const allowedRoles = ['SuperAdmin'];
        if(allowedRoles.includes(userRoles)){
            await ShippingAddress.destroy({
                where: {
                    id: req.params.id
                }
            });
            return res.status(200).json({
                statusMessage: 'Shipping address deleted.'
            })
        }else{
            const deletedRows = await ShippingAddress.destroy({
                where: {
                    userId: res.locals.userId,
                    id: req.params.id
                }
            });
            if(deletedRows[0]){
                return res.status(200).json({
                    statusMessage: 'Shipping address deleted.'
                })
            }else{
                return res.status(404).json({
                    type: 'NotFoundError',
                    statusMessage: 'Unable to delete shipping address. Address not found.'
                });
            }
        }
    }catch(e){
        next(e);
    }
}