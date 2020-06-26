'use strict';
const db = require('../models');
const Product = db.Product;
const Category = db.Category;
const validators = require('../helpers/validation');

exports.addProductCategory = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const product = await Product.findByPk(req.body.productId);
        await product.addCategory(req.body.category, {});
        return res.status(200).json({
            statusMessage: 'Category added to product.'
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.addCategoryProduct = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const category = await Category.findByPk(req.body.categoryId);
        await category.addProduct(req.body.product, {});
        return res.status(200).json({
            statusMessage: 'Product added to category.'
        })
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.removeCategoryFromProduct = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const product = await Product.findByPk(req.body.productId);
        await product.removeCategory(req.body.category);
        return res.status(200).json({
            statusMessage: 'Category removed from this product.'
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to remove category from the product at this time.'
        });
    }
}

exports.removeProductFromCategory = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const category = await Category.findByPk(req.body.categoryId);
        await category.removeProduct(req.body.product);
        return res.status(200).json({
            statusMessage: 'Product removed from this category.'
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to remove product from category at this time.'
        });
    }
}

exports.updateProductCategories = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const product = await Product.findByPk(req.body.productId);
        const productCategories = await product.setCategories(req.body.categories);
        return res.status(200).json({
            statusMessage: 'Product categories updated.',
            productCategories
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to update product categories at this time.'
        });
    }
}

exports.updateCategoryProducts = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const category = await Category.findByPk(req.body.categoryId);
        const categoryProducts = await category.setProducts(req.body.products);
        return res.status(200).json({
            statusMessage: 'Category products updated.',
            categoryProducts
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Failed to update category products at this time.'
        })
    }
}

exports.getProductCategories = async (req, res, next) => {
    try{
        const product = await Product.findByPk(req.params.productId);
        const productCategories = await product.getCategories({
            attributes: ['id', 'name'],
            joinTableAttributes: ['categoryId', 'productId']
        });
        return res.status(200).json({
            statusMessage: 'Product categories returned',
            productCategories
        });
    }catch(e){
        console.log(e);
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Failed to retrieve product categories.'
        });
    }
}

exports.getCategoryProducts = async (req, res, next) => {
    try{
        const category = await Category.findByPk(req.params.categoryId);
        const categoryProducts = await category.getProducts({
            attributes: ['id', 'name'],
            joinTableAttributes: ['productId', 'categoryId']
        });
        return res.status(200).json({
            statusMessage: 'Category products returned.',
            categoryProducts
        });
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Failed to retrieve catagory products.'
        });
    }
}