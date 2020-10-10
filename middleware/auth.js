'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

function createToken(id, email, role, secret, isRefresh, expiresAt) {
    return new Promise((resolve, reject)=>{
        //check if we are generating a refresh token or access token
        if(isRefresh){
            jwt.sign({
                userId: id,
                email: email,
                role: role,
                isRefresh: true,
                iat: Math.floor(Date.now()/1000),
                exp: expiresAt
            }, secret, {
                algorithm: 'HS256',
                // expiresIn: '12h',
            }, (err, token)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(token)
                }
            });
        }else{
            //generate an access token
            jwt.sign({
                userId: id,
                email: email,
                role: role,
                isRefresh: false,
                iat: Math.floor(Date.now()/1000),
                exp: expiresAt
            }, secret, {
                algorithm: 'HS256',
                // expiresIn: '1h'
            }, (err, token)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(token)
                }
            });
        }
    })
}

function verifyToken(token, secret){
    return new Promise((resolve, reject)=>{
        jwt.verify(token, secret, (err, decoded)=>{
            if(err){
                reject(err)
            }else{
                resolve(decoded)
            }
        })
    });
}

exports.generateToken =  async (req, res, next) => {
    try{
        const currentDate = Date.now();
        const accessTokenExpiration = Math.floor(currentDate / 1000) + (60 * 60);
        const refreshTokenExpiration = Math.floor(currentDate / 1000) + (60 * 60 * 12);
        const refreshToken = await createToken(res.locals.userId, res.locals.email, res.locals.role, process.env.TOKEN_SECRET, true, refreshTokenExpiration);
        const accessToken = await createToken(res.locals.userId, res.locals.email, res.locals.role, process.env.TOKEN_SECRET, false, accessTokenExpiration);
        res.locals.accessToken = accessToken;
        res.locals.refreshToken = refreshToken;
        res.locals.expiresAt = accessTokenExpiration * 1000;
        res.locals.refreshBy = refreshTokenExpiration * 1000;
        next();
    }catch(err){
        return res.status(500).json({
            statusMessage: 'Unable to complete login. Token generation failed.'
        });
    }
}

exports.validateToken = async (req, res, next) => {
    const accessToken = req.headers.authorization;
    if(!accessToken){
        return res.status(401).json({
            type: 'AuthenticationError',
            statusMessage: 'No token provided. Unauthenticated request.'
        })
    }
    try{
        const decoded = await verifyToken(accessToken, process.env.TOKEN_SECRET);
        if(!decoded.isRefresh){
            res.locals.userId = decoded.userId;
            res.locals.email = decoded.email;
            res.locals.role = decoded.role;
            next();
        }else{
            return res.status(401).json({
                type: 'AuthenticationError',
                statusMessage: 'Invalid token. Refresh token provided.'
            });
        }
    }catch(e){
        if(e.name === 'TokenExpiredError'){
            return res.status(400).json({
                type: e.name,
                statusMessage: 'Access token is expired. Refresh your tokens.'
            })
        }else{
            return res.status(401).json({
                type: e.name,
                statusMessage: 'Access token is invalid.'
            })
        }
    }
}

exports.refreshTokens = async(req, res, next)=>{
    const token = req.headers.authorization;
    try{
        const decoded = await verifyToken(token, process.env.TOKEN_SECRET);
        const currentDate = Date.now();
        const accessTokenExpiration = Math.floor(currentDate / 1000) + (60 * 60);
        const refreshTokenExpiration = Math.floor(currentDate / 1000) + (60 * 60 * 12);
        const refreshToken = await createToken(decoded.userId, decoded.email, decoded.role, process.env.TOKEN_SECRET, true, refreshTokenExpiration);
        const accessToken = await createToken(decoded.userId, decoded.email, decoded.role, process.env.TOKEN_SECRET, false, accessTokenExpiration);
        res.locals.refreshToken = refreshToken;
        res.locals.accessToken = accessToken;
        res.locals.expiresAt = accessTokenExpiration * 1000;
        res.locals.refreshBy = refreshTokenExpiration * 1000;
        next();
    }catch(e){
        if(e.name === 'TokenExpiredError'){
            return res.status(400).json({
                type: e.name,
                statusMessage: 'Refresh token is expired. Please sign in again.'
            })
        }else{
            return res.status(400).json({
                type: e.name,
                statusMessage: 'Refresh token is invalid.'
            })
        }
    }
}