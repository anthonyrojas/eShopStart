'use strict';

const db = require('../models');
const Inventory = db.Inventory;
const validators = require('../helpers/validation');

exports.addInventory = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to add inventory.'
        });
    }
    const validationErrors = validators.validateInventoryRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const inventory = await Inventory.create({
            productId: req.body.productId,
            amount: req.body.amount
        });
        return res.status(200).json({
            statusMessage: 'Product inventory created.',
            inventory: inventory.toJSON()
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updateInventory = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to update inventory.'
        });
    }
    const validationErrors = validators.validateInventoryRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const updatedRows = await Inventory.update({
            amount: req.body.amount
        }, {
            where: {
                productId: req.params.productId
            }
        });
        if(updatedRows[0] === 0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update product inventory because it was not found.'
            });
        }
        const updatedInventory = await Inventory.findOne({
            where: {
                productId: req.params.productId
            }
        });
        return res.status(200).json({
            statusMessage: 'Inventory returned.',
            inventory: updatedInventory
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.getInventory = async(req, res) => {
    try{
        const inventory = await Inventory.findOne({
            where: {
                productId: req.params.productId
            }
        });
        return res.status(200).json({
            statusMessage: 'Inventory retrieved.',
            inventory
        });
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to retrive product inventory at this time.'
        });
    }
}