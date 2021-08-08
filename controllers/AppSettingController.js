'use strict';
const db = require('../models');
const shippo = require('shippo')(process.env.SHIPPO_KEY);
const AppSetting = db.AppSetting;

exports.getAppSettingCategories = async(req, res) =>{
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin'];
    if(allowedRoles.includes(userRole)){
        return res.status(200).json({
            categories: [
                'from_address',
                'business',
                'logo'
            ],
            statusMessage: 'App setting categories returned.'
        })
    }else{
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to access this resource.'
        })
    }
}

exports.addAppSetting = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin'];
    try{
        if(allowedRoles.includes(userRole)){
            const settingCount = await AppSetting.count({
                col: 'id',
                where: {
                    category: req.body.category
                },
                raw: true
            });
            if(settingCount > 0){
                return res.status(400).json({
                    type: 'AppSettingError',
                    statusMessage: 'An app setting for this category already exists. Edit the existing value rather than adding a new one.'
                })
            }else{
                //check if this is the from address
                if(req.body.category === 'from_address'){
                    //validate it with shippo and save the shippo address id
                    const fromAddress = shippo.address.create({
                        name: req.body.content.name,
                        street1: req.body.content.street,
                        city: req.body.content.city,
                        state: req.body.content.state,
                        zip: req.body.content.zip,
                        country: req.body.content.country,
                        validate: true
                    });
                    if(fromAddress.validation_results.is_valid){
                        //save the object id
                        req.body.content.shippoId = fromAddress.object_id;
                    }else{
                        //inform the client the address is invalid
                        return res.status(400).json({
                            type: 'ValidationError',
                            statusMessage: 'The address is not valid.'
                        });
                    }
                }
                const appSetting = await AppSetting.create({
                    category: req.body.category,
                    content: req.body.content
                });
                return res.status(200).json({
                    statusMessage: 'App setting added.',
                    appSetting
                })
            }
        }else{
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to access this resource.'
            });
        }
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updateAppSetting = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin'];
    try{
        if(allowedRoles.includes(userRole)){
            const updatedRows = await AppSetting.update({
                content: req.body.content
            }, {
                where: {
                    id: req.params.id
                }
            });
            if(updatedRows[0] === 0){
                return res.status(404).json({
                    type: 'NotFoundError',
                    statusMessage: 'Unable to update app setting because it could not be located.'
                })
            }else{
                const appSetting = await AppSetting.findOne({
                    id: req.params.id
                });
                return res.status(200).json({
                    statusMessage: 'App setting updated.',
                    appSetting
                });
            }
        }else{
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to access this resource.'
            })
        }
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.getAppSettings = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin'];
    try{
        if(allowedRoles.includes(userRole)){
            const appSettings = await AppSetting.findAll();
            return res.status(200).json({
                statusMessage: 'App settings returned.',
                appSettings
            });
        }else{
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to access this resource.'
            });
        }
    }catch(e){
        next(e);
    }
}

exports.getAppSetting = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin'];
    try{
        if(allowedRoles.includes(userRole)){
            const appSetting = await AppSetting.findByPk(req.params.id);
            return res.status(200).json({
                statusMessage: 'App setting returned.',
                appSetting
            });
        }else{
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to access this resource.'
            })
        }
    }catch(e){
        next(e);
    }
}