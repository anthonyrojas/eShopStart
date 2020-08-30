'use strict';
const db = require('../models');
const MailTemplate = db.MailTemplate;

exports.createTemplate = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    try{
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to add a mail template.'
            });
        }
        //create a new mail template
        const template = await MailTemplate.create({
            primaryTemplate: req.body.primaryTemplate,
            description: req.body.description,
            content: req.body.content,
            name: req.body.name,
            category: req.body.category
        });
        //check if this new template is a primary
        if(req.body.primaryTemplate){
            //set other templates in this category as not primary
            await MailTemplate.update({
                primaryTemplate: false
            },
            {
                where: {
                    id: {
                        [db.sequelize.Op.not]: template.id
                    },
                    category: req.body.category
                }
            });
        }
        return res.status(200).json({
            statusMessage: 'Mail template created.',
            template
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}
exports.getTemplates = async (req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    try{
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                type: 'AuthorizationError', 
                statusMessage: 'You are not authorized to view mail templates'
            });
        }
        const templates = await MailTemplate.findAll({
            attributes: ['id', 'createdAt', 'updatedAt', 'name', 'description', 'category']
        });
        return res.status(200).json({
            statusMessage: 'Mail templates returned.',
            templates
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Unable to retrieve mail templates at this time.'
        });
    }
}
exports.getTemplate = async(req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    try{
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                type: 'AuthorizationError', 
                statusMessage: 'You are not authorized to view mail templates'
            });
        }
        const template = await MailTemplate.findOne({
            where: {
                id: req.params.id
            },
            raw: true
        });
        if(!template){
            return res.status(400).json({
                type: 'NotFoundError',
                statusMessage: `Unable to find mail template with id#${req.params.id}`
            });
        }
        return res.status(200).json({
            statusMessage: 'Mail template returned.',
            template
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Unable to fetch mail template at this time.'
        })
    }
}
exports.updateTemplate = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    try{
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                type: 'AuthorizationError', 
                statusMessage: 'You are not authorized to update mail templates'
            });
        }
        const updatedRows = await MailTemplate.update({
            primaryTemplate: req.body.primaryTemplate,
            description: req.body.description,
            content: req.body.content,
            name: req.body.name,
            category: req.body.category
        },
        {
            where: {
                id: req.params.id
            }
        });
        if(updatedRows[0] === 0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update template becasue it was not found.'
            });
        }
        //check if this new template is a primary
        if(req.body.primaryTemplate){
            //set other templates in this category as not primary
            await MailTemplate.update({
                primaryTemplate: false
            },
            {
                where: {
                    id: {
                        [db.sequelize.Op.not]: req.params.id
                    },
                    category: req.body.category
                }
            });
        }
        const template = await MailTemplate.findOne({
            where: {
                id: req.params.id
            },
            raw: true
        })
        return res.status(200).json({
            statusMessage: 'Mail template updated.',
            template
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}
exports.deleteTemplate = async(req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    try{
        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                type: 'AuthorizationError', 
                statusMessage: 'You are not authorized to delete mail templates.'
            });
        }
        return res.status(200).json({
            statusMessage: 'Mail template deleted.'
        });
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Unable to delete mail template at this time.'
        });
    }
}