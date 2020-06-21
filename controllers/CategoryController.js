'use strict';
const db = require('../models');
const validators = require('../helpers/validation');
const Sequelize = require('sequelize');
const Category = db.Category;

exports.addCategory = async (req, res, next)=>{
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to add a category.'
        });
    }
    const validationErrors = validators.validateCategoryRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const category = await Category.create({
            name: req.body.name
        });
        return res.status(200).json({
            statusMessage: 'Category created.',
            category: category.toJSON()
        });
    }catch(e){
        next(e);
        res.locals.errOperation = 'db';
    }
}

exports.updateCategory = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to update a category.'
        });
    }
    const validationErrors = validators.validateCategoryRequest(req);
    if(validationErrors.errorExists){
        return req.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission.',
            errors: validationErrors.errors
        });
    }
    try{
        const updatedRows = await Category.update({
            name: req.body.name
        }, {
            where: {
                id: req.params.id
            }
        });
        if(updatedRows[0] === 0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update category because it was not found.'
            });
        }
        const updatedCategory = await Category.findByPk(req.params.id);
        return res.status(200).json({
            statusMessage: 'Category updated.',
            category: updatedCategory
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.getCategory = async (req, res) => {
    try{
        const category = await Category.findByPk(req.params.id);
        return res.status(200).json({
            statusMessage: 'Category returned.',
            category
        });
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to find or retrieve category.'
        });
    }
}

exports.getCategories = async(req, res) => {
    try{
        const categories = await Category.findAll({
            attributes: ['id', 'name']
        });
        return res.status(200).json({
            statusMessage: 'Categories returned.',
            categories
        })
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Unable retrieve categories.'
        });
    }
}

exports.deleteCategory = async (req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to delete a category.'
        });
    }
    try{
        const deletedRows = await Category.destroy({
            where: {
                id: req.params.id
            }
        });
        return res.status(200).json({
            statusMessage: 'Category deleted.'
        });
    }catch(e){
        return res.status(400).json({
            type: 'DeleteError',
            statusMessage: 'Unable to delete category at this time, or this category no longer exists.'
        });
    }
}