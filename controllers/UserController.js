'use strict';
require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const User = db.User;
const validators = require('../helpers/validation');
const helpers = require('../helpers');

function generateHash(plainTextPassword, saltRounds) {
    return new Promise((resolve, reject)=>{
        bcrypt.hash(plainTextPassword, saltRounds, function(err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
}

function compareHash(plainTextPassword, hashedPassword) {
    return new Promise((resolve, reject)=>{
        bcrypt.compare(plainTextPassword, hashedPassword, function(err, result){
            if(err) reject(err)
            resolve(result)
        })
    })
}

exports.beginLogin = async (req, res, next) => {
    const validationErrors = validators.validateLoginRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your sumbission',
            errors: validationErrors.errors            
        });        
    }
    try{
        const user = await User.findOne({
            where: {
                email: req.body.email.toLowerCase()
        
            },
            attributes: ['id', 'email', 'password', 'role']
        });
        if(user === null){
            return res.status(400).json({
                type: 'UserNotFound',
                statusMessage: 'A user with that email does not exist.',
                errors: {}
            });
        }
        const validLogin = await compareHash(req.body.password, user.password);
        if(validLogin){
            res.locals.userId = user.id;
            res.locals.email = user.email.toLowerCase();
            res.locals.role = user.role;
            next();
        }else{
            return res.status(400).json({
                type: 'AuthenticationError',
                statusMessage: 'Login failed.',
                errors: {}
            })
        }
    }catch(e){
        return res.status(400).json({
            type: 'AuthenticationError',
            statusMessage: 'Login failed.',
            errors: {}
        })
    }
}

exports.completeLogin = async (req, res) => {
    return res.status(200).json({
        refreshToken: res.locals.refreshToken,
        accessToken: res.locals.accessToken,
        expiresAt: res.locals.expiresAt,
        refreshBy: res.locals.refreshBy
    });
}

exports.refreshTokens = async (req, res) => {
    return res.status(200).json({
        refreshToken: res.locals.refreshToken,
        accessToken: res.locals.accessToken,
        expiresAt: res.locals.expiresAt,
        refreshBy: res.locals.refreshBy
    })
}

//create a user account
exports.addAccount = async (req, res, next) => {
    const validationErrors = validators.validateUserRequest(req, 'add', res.locals.role);
    
    if(validationErrors.errorExists){
        return res.status(500).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your submission',
            errors: validationErrors.errors            
        });
    }
    try{
        let userRole = 'Customer';
        const saCount = await User.count({
            col: 'id',
            where: {
                role: 'SuperAdmin'
            }
        });
        //check if user is signed in
        if(!helpers.isUndefinedOrNull(res.locals.userId) && res.locals.role === 'SuperAdmin'){
            userRole = req.body.role;
        }else if(saCount === 0){
            userRole = 'SuperAdmin';
        }else if(!helpers.isUndefinedOrNull(res.locals.userId) && res.locals.role !== 'SuperAdmin'){
            //the signed in user is not a superadmin, and therefore cannot add accounts
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to add an account.'
            });
        }
        const hashedPassword = await generateHash(req.body.password, parseInt(process.env.SALT_ROUNDS));
        const user = await User.create({
            email: req.body.email.trim().toLowerCase(),
            password: hashedPassword,
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            middleInitial: req.body.middleInitial || null,
            birthdate: new Date(req.body.birthdate).toISOString(),
            role: userRole
        });
        user.password = undefined;
        return res.status(200).json({
            statusMessage: 'Account created.',
            user: user.toJSON()
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updateUser = async (req, res, next) => {
    let userRole = res.locals.role;
    let userId = res.locals.userId;
    let validationErrors = null;
    if(userRole === 'SuperAdmin'){
        validationErrors = validators.validateUserRequest(req, 'update account');
    }else{
        validationErrors = validators.validateUserRequest(req, 'update');
    }
    if(res.locals.role === 'SuperAdmin'){
        userRole = req.body.role;
        userId = req.body.id
    }else if(!helpers.isUndefinedOrNullOrEmpty(req.body.id) && req.body.id !== res.locals.userId){
        return res.status(403).json({
            type:'AuthorizationError',
            statusMessage: 'You are not authorized to update someone else\'s account.'
        });
    }
    if(validationErrors.errorExists){
        return res.status(500).json({
            type: 'ValidationError',
            statusMessage: 'There are errors in your sumbission',
            errors: validationErrors.errors            
        });
    }
    try{
        const updatedRows = await User.update({
            email: req.body.email.trim().toLowerCase(),
            firstName: req.body.firstName.trim(),
            lastName: req.body.lastName.trim(),
            middleInitial: req.body.middleInitial || null,
            birthdate: req.body.birthdate,
            role: userRole
        }, {
            where: {
                id: userId
            }
        });
        if(updatedRows[0] === 0){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update user because it was not found.'
            });
        }
        const updatedUser = await User.findByPk(userId);
        updatedUser.password = undefined;
        return res.status(200).json({
            statusMessage: 'Account updated.',
            user: updatedUser.toJSON()
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.updatePassword = async (req, res) => {
    let userId = res.locals.userId;
    const validationErrors = validators.validatePasswordChangeRequest(req);
    if(validationErrors.errorExists){
        return res.status(400).json({
            type: 'ValidationError',
            statusMessage: 'There are fields missing in your submission.',
            errors: validationErrors.errors
        });
    }
    if(res.locals.role === 'SuperAdmin'){
        userId = req.body.id;
    }else if(userId !== req.body.id){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to change this user\'s password.'
        });
    }
    try{
        const hashedPassword = await generateHash(req.body.password, process.env.SALT_ROUNDS);
        await User.update({
            password: hashedPassword
        }, {
            where: {
                id: userId
            }
        });
        return res.status(200).json({
            statusMessage: 'Password updated successfully.'
        })
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: 'Password change failed.'
        });
    }
}

exports.getUser = async (req, res) => {
    let userId = res.locals.userId;
    if(!helpers.isUndefinedOrNullOrEmpty(req.params.id) && res.locals.role === 'SuperAdmin'){
        userId = req.params.id;
    }else if(!helpers.isUndefinedOrNullOrEmpty(req.params.id) && res.locals.role !== 'SuperAdmin'){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to retrieve another user account.'
        });
    }
    try{
        const user = await User.findByPk(userId);
        user.password = undefined;
        return res.status(200).json({
            user
        });
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Unable to retrieve account.'
        });
    }
}

exports.getUsers = async(req, res) => {
    let userId = res.locals.userId;
    try{
        if(res.locals.role === 'SuperAdmin'){
            let limit = helpers.isUndefinedOrNullOrEmpty(req.query.limit) ? 20 : Number(req.query.limit);
            let skip = helpers.isUndefinedOrNullOrEmpty(req.query.skip) ? 0 : Number(req.query.skip);
            const users = await User.findAll({
                attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt'],
                limit: limit,
                offset: skip
            });
            return res.status(200).json({
                statusMessage: 'Users returned.',
                users,
                limit,
                skip,
                total: await User.count({col: 'id'})
            });
        }else{
            return res.status(403).json({
                type: 'AuthorizationError',
                statusMessage: 'You are not authorized to view users accounts.'
            });
        }
    }catch(e){
        return res.status(500).json({
            type: e.name,
            statusMessage: e.message
        });
    }
}