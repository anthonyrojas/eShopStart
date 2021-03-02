'use strict';
const db = require('../models');
const AWS = require('aws-sdk')
const fs = require('fs');
const Product = require('../routes/Product');
const ProductImage = db.ProductImage;

function uploadToS3(s3, params){
    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data){
            if(err) reject(err)
            resolve(data)
        });
    });
}

function removeLocalFile(path){
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err)=>{
            if(err) reject(err)
            resolve({status: 'Success'});
        })
    })
}

function deleteFromS3(s3, params){
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err, data)=>{
            if(err) reject(err)
            resolve(data)
        })
    })
}

exports.getProductImages = async(req, res, next) => {
    try{
        const productImages = await ProductImage.findAll({
            where:{
                productId: req.params.id
            }
        });
        return res.status(200).json({
            statusMessage: 'Product images returned.',
            productImages
        })
    }catch(e){
        return res.status(404).json({
            type: e.name,
            statusMessage: 'Unable to retrieve the product images at this time or the images were not found for this product.'
        });
    }
}

exports.getProductImage = async(req, res, next) => {
    try{
        const productImage = await ProductImage.findOne({
            where: {
                productId: req.params.id
            },
            order: [['order', 'ASC']]
        })
        return res.status(200).json({
            productImage
        });
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: 'Failed to get product image at this time or that product does not exist.'
        })
    }
}

exports.addProductImage = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    const file = req.file;
    const isLocal = (process.env.USING_S3 !== 'true');
    try{
        let productImage;
        const imgOrder = await ProductImage.max('order', {
            where: {
                productId: req.params.productId
            }
        });
        if(!isLocal){
            const s3 = new AWS.S3({
                accessKeyId: process.env.S3_ID,
                secretAccessKey: process.env.S3_SECRET
            });
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `${req.params.productId}/${file.filename}`,
                Body: file
            };
            const fileUpload = await uploadToS3(s3, params);
            await removeLocalFile(file.path);
            productImage = await ProductImage.create({
                url: fileUpload.Location,
                order: isNaN(imgOrder) ? 0 : imgOrder + 1,
                productId: req.params.productId,
                isLocal: isLocal
            });
        }else{
            productImage = await ProductImage.create({
                url: file.path,
                order: isNaN(imgOrder) ? 0 : imgOrder + 1,
                productId: req.params.productId,
                isLocal: isLocal
            });
        }
        return res.status(200).json({
            productImage: productImage.toJSON(),
            statusMessage: 'Product image uploaded successfully.'
        });
    }catch(e){
        next(e);
        // const err = new Error('Failed to upload product image at this time.');
        next(err);
    }
}

exports.updateProductImage = async (req, res, next) =>{
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const updatedRows = await ProductImage.update({
            order: req.body.order
        }, {
            where: {
                id: req.params.imageId
            }
        });
        return res.status(200).json({
            statusMessage: 'Product image updated.'
        });
    }catch(e){
        next(e);
    }
}

exports.updateProductImages = async(req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const product = await Product.findByPk(req.params.productId);
        const productImages = await product.setProductImages(req.body.productImages);
        return res.status(200).json({
            statusMessage: 'Product images updated.',
            productImages: productImages
        });
    }catch(e){
        next(e);
    }
}

exports.deleteProductImage = async (req, res, next) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.includes(userRole)){
        return res.status(403).json({
            type: 'AuthorizationError', 
            statusMessage: 'You are not authorized to perform this action.'
        })
    }
    try{
        const productImage = await ProductImage.findByPk(req.params.id);
        const order = productImage.order;
        const productId = productImage.productId;
        if(productImage.isLocal){
            //delete from the local drive
            await removeLocalFile(productImage.url);
        }else{
            //delete from s3
            const s3 = new AWS.S3({
                accessKeyId: process.env.S3_ID,
                secretAccessKey: process.env.S3_SECRET
            });
            const filenameArr = productImage.url.split('/');
            const filename = filenameArr[filenameArr.length - 1];
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `${productId}/${filename}`
            };
            await deleteFromS3(s3, params);
        }
        const deletedRows = await ProductImage.destroy({
            where: {
                id: req.params.id
            }
        });
        await db.sequelize.query('UPDATE `ProductImages` SET order = order - 1 WHERE order > ? AND productId = ?', {
            replacements: [order, productId],
            type: db.Sequelize.QueryTypes.UPDATE
        })
        return res.status(200).json({
            statusMessage: 'Product image deleted.'
        });
    }catch(e){
        next(e);
    }
}