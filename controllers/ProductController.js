'use strict';

const db = require('../models');
const Sequelize = require('sequelize');
const Product = db.Product;
const validators = require('../helpers/validation');

exports.addProduct = async (req, res, next)=>{
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
        const slug = req.body.name.trim().toLowerCase().replace(/\ /, "-");
        const product = await Product.create({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            price: req.body.price,
            slug: slug,
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
        res.locals.errOperation='db';
        next(e);
    }
}

exports.updateProduct = async (req, res, next) => {
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
        const slug = req.body.name.trim().toLowerCase().replace(/\ /, "-");
        const updatedRows = await Product.update({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            price: req.body.price,
            slug: slug,
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
        if(updatedRows[0] === 0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update product because it was not found.'
            });
        }
        const updatedProduct = await Product.findByPk(req.params.id);
        return res.status(200).json({
            statusMessage: 'Product updated.',
            product: updatedProduct.toJSON()
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
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

exports.getProducts = async (req, res) => {
    try{
        const products = await Product.findAll({
            attributes: ['id', 'name', 'slug', 'price', 'isActive']
        });
        return res.status(200).json({
            statusMessage: 'Products returned.',
            products
        });
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Unable to retrieve products'
        });
    }
}

exports.deleteProduct = async (req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to add a product.'
        });
    }
    try{
        const deletedRows = await Product.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.status(200).json({
            statusMessage: 'Product deleted.'
        })
    }catch(e){
        return res.status(400).json({
            type: 'DeleteError',
            statusMessage: 'Unable to delete product at this time, or this product no longer exists.'
        });
    }
}

exports.getProductBySlug = async (req, res) => {
    try{
        const product = await Product.findOne({
            where: {
                slug: req.params.slug
            }
        });
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