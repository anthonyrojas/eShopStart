'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const Product = db.Product;
const validators = require('../helpers/validation');

exports.addProduct = async (req, res)=>{
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to add a product.'
        });
    }
    const validationErrors = validators.validateProductRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            isDeliverable: req.body.isDeliverable,
            isDigital: req.body.isDigital,
            weight: req.body.weight || null,
            upc: req.body.upc || null,
            isbn: req.body.isbn || null,
            isActive: req.body.isActive
        });
        return res.status(200).json({
            statusMessage: 'Product created.',
            product: product.toJSON()
        });
    }catch(e){
        if(e.name.includes(Sequelize.ValidationError.name)){
            let errorCollection = {};
            if(e !== undefined && Array.isArray(e.errors)){
                e.errors.forEach(element => {
                    errorCollection[element.path] = element.message;
                });
                return res.status(400).json({
                    type: e.name,
                    statusMessage: e.message,
                    errors: errorCollection
                })
            }else{
                return res.status(400).json({
                    type: e.name,
                    statusMessage: 'There are errors in your submission.',
                    errors: errorCollection
                })
            }
        }
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to create product.'
        });
    }
}

exports.updateProduct = async (req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to add a product.'
        });
    }
    const validationErrors = validators.validateProductRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const updatedRows = await Product.update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            isDeliverable: req.body.isDeliverable,
            isDigital: req.body.isDigital,
            weight: req.body.weight,
            upc: req.body.upc,
            isbn: req.body.isbn,
            isActive: req.body.isActive
        }, {
            where: {
                id: req.params.id
            }
        });
        const updatedProduct = await Product.findByPk(req.params.id);
        return res.status(200).json({
            statusMessage: 'Product updated.',
            product: updatedProduct.toJSON()
        });
    }catch(e){
        if(e.name.includes(Sequelize.ValidationError.name)){
            let errorCollection = {};
            if(e !== undefined && Array.isArray(e.errors)){
                e.errors.forEach(element => {
                    errorCollection[element.path] = element.message;
                });
                return res.status(400).json({
                    type: e.name,
                    statusMessage: e.message,
                    errors: errorCollection
                })
            }else{
                return res.status(400).json({
                    type: e.name,
                    statusMessage: 'There are errors in your submission.',
                    errors: errorCollection
                })
            }
        }
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to update product.'
        });
    }
}

exports.getProduct = async (req, res) => {
    try{
        const product = await Product.findByPk(req.params.id);
        return res.status(200).json({
            statusMessage: 'Product returned.',
            product: product
        });
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to find or retrieve product.'
        })
    }
}