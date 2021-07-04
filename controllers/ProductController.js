'use strict';
const fs = require('fs');
const db = require('../models');
const Product = db.Product;
const ProductImage = db.ProductImage;
const Inventory = db.Inventory;
const ProductCategory = db.ProductCategory;
const Category = db.Category;
const validators = require('../helpers/validation');
const { isUndefinedOrNull, isUndefinedOrNullOrEmpty } = require('../helpers');
const jwt = require('jsonwebtoken');

function removeLocalFile(path){
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            if(err) reject(err);
            resolve({status: 'Success'});
        }) 
    })
}

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
        let slug = req.body.name.trim().toLowerCase().replace(/\s /, "-");
        //.replaceAll(/\s /, "-")
        slug = slug.split(' ').join('-');
        //check if it is a digital product
        let digitalPath;
        if(req.body.isDigital && req.file){
            digitalPath = req.file.path;
        }else if(req.body.isDigital && !req.file){
            return res.status(400).json({
                type: 'Error',
                statusMessage: 'Product file required when it is a digital product.'
            });
        }
        const product = await Product.create({
            name: req.body.name.trim(),
            description: req.body.description.trim(),
            price: req.body.price,
            slug: slug,
            isDeliverable: req.body.isDeliverable,
            isDigital: req.body.isDigital,
            digitalPath: digitalPath,
            downloadsPermitted: req.body.downloadsPermitted,
            weight: req.body.weight || null,
            length: req.body.length || null,
            width: req.body.width || null,
            height: req.body.height || null,
            sku: req.body.sku || null,
            upc: req.body.upc || null,
            isbn: req.body.isbn || null,
            isActive: req.body.isActive
        });
        await Inventory.create({
            productId: product.id,
            amount: 0
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
        const urlLength = req.baseUrl.split('/').length;
        let digitalPath = null;
        const product = await Product.findByPk(req.params.id);
        if(!product){
            return res.status(404).json({
                type: 'NotFoundError',
                statusMessage: 'Unable to update product because it was not found.'
            })
        }
        const slug = req.body.name.trim().toLowerCase().replace(/\s /, "-");
        if(req.body.isDigital && req.baseUrl.split('/')[urlLength-1] === 'digital'){
            product.downloadsPermitted = req.body.downloadsPermitted;
            //check if a file is included with the update
            if(req.file){
                //delete the current file
                removeLocalFile(product.digitalPath);
                product.digitalPath = req.file.path;
            }
        }else if(!req.body.isDigital && product.isDigital){
            //delete the product because it is no longer digital
            removeLocalFile(product.digitalPath);
            product.isDigital = false;
            product.digitalPath = false
            product.downloadsPermitted = null;
        }
        product.name = req.body.name.trim();
        product.description = req.body.description;
        product.price = req.body.price;
        product.slug = slug;
        product.isDeliverable = req.body.isDeliverable;
        product.weight = req.body.weight;
        product.length = req.body.length;
        product.width = req.body.width;
        product.height = req.body.height;
        product.sku = req.body.sku;
        product.upc = req.body.upc;
        product.isbn = req.body.isbn;
        product.isActive = req.body.isActive;
        await product.save();
        return res.status(200).json({
            statusMessage: 'Product updated.',
            product: product.toJSON()
        });
    }catch(e){
        res.locals.errOperation = 'db';
        next(e);
    }
}

exports.getProduct = async (req, res) => {
    try{
        const product = await Product.findByPk(req.params.id, {
            include: ProductImage,
            order: [
                [{
                    model: ProductImage
                }, 'order', 'asc']
            ]
        });
        if(!product){
            return res.status(404).json({
                statusMessage: 'Unable to find or retrieve product.',
                type: 'NotFoundError'
            });
        }else{
            return res.status(200).json({
                statusMessage: 'Product returned.',
                product: product
            });
        }
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to find or retrieve product.'
        })
    }
}

exports.getProducts = async (req, res) => {
    try{
        let limit = isUndefinedOrNull(req.query.limit) ? 20 : Number(req.query.limit);
        let skip = isUndefinedOrNull(req.query.skip) ? 0 : Number(req.query.skip);
        let orderBy = isUndefinedOrNullOrEmpty(req.query.orderBy)  ? '' : req.query.orderBy;
        let sort = 'ASC';
        if(!isUndefinedOrNullOrEmpty(req.query.sort) && (req.query.sort.toLowerCase() !== 'asc' || req.query.sort.toLowerCase() !== 'desc')){
            sort = sort.toUpperCase();
        }
        let sortingCmds = []
        if(!isUndefinedOrNullOrEmpty(orderBy)){
            for(let k in Product.rawAttributes){
                if(k === orderBy){
                    sortingCmds.push([orderBy, sort]);
                }
            }
        }
        if(orderBy !== 'id'){
            sortingCmds.push(['id', 'ASC']);
        }
        const products = await Product.findAll({
            attributes: ['id', 'name', 'slug', 'price', 'isActive'],
            include:{
                model: ProductImage,
                required: false,
                where: {
                    order: 0
                },
            },
            order: sortingCmds,
            limit: limit,
            offset: skip
        });
        return res.status(200).json({
            statusMessage: 'Products returned.',
            products,
            limit,
            skip,
            total: await Product.count({
                col: 'id'
            })
        });
    }catch(e){
        return res.status(400).json({
            type: e.name,
            statusMessage: e.message
        });
    }
}

exports.deleteProduct = async (req, res) => {
    const userRole = res.locals.role;
    const allowedRoles = ['SuperAdmin', 'Admin'];
    if(!allowedRoles.contains(userRole)){
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
            include: ProductImage,
            where: {
                slug: req.params.slug
            },
            order: [
                [{
                    model: ProductImage
                }, 'order', 'asc']
            ]
        });
        if(!product){
            return res.status(404).json({
                statusMessage: 'Unable to find or retrieve product.',
                type: 'NotFoundError'
            });
        }else{
            return res.status(200).json({
                statusMessage: 'Product returned.',
                product: product
            });
        }
    }catch(e){
        return res.status(404).json({
            type: 'NotFoundError',
            statusMessage: 'Unable to find or retrieve product.'
        })
    }
}

exports.searchProducts = async(req, res, next) => {
    try{
        // look for query variables
        const categories = isUndefinedOrNullOrEmpty(req.query.categories) ? await Category.findAll({attributes: ['id'], raw: true}) : req.query.categories.split(',');
        const priceStart = isUndefinedOrNullOrEmpty(req.query.priceStart) ? Number.MIN_VALUE : Number(req.query.priceStart);
        const priceEnd = isUndefinedOrNullOrEmpty(req.query.priceEnd) ? Number.MAX_VALUE : Number(req.query.priceEnd);
        const productName = isUndefinedOrNullOrEmpty(req.query.productName) ? '' : req.query.productName;
        let orderBy = isUndefinedOrNullOrEmpty(req.query.orderBy)  ? null : req.query.orderBy;
        let sort = 'ASC';
        if(!isUndefinedOrNullOrEmpty(req.query.sort) && (req.query.sort.toLowerCase() !== 'asc' || req.query.sort.toLowerCase() !== 'desc')){
            sort = sort.toUpperCase();
        }
        let sortingCmds = []
        if(!isUndefinedOrNullOrEmpty(orderBy)){
            for(let k in Product.rawAttributes){
                if(k === orderBy){
                    sortingCmds.push([orderBy, sort]);
                }
            }
        }
        if(orderBy !== 'id'){
            sortingCmds.push(['id', 'ASC']);
        }
        const products = await Product.findAll({
            attributes: ['id', 'name', 'slug', 'price', 'isActive'],
            include: [
                {
                    attributes: [],
                    model: ProductCategory,
                    where: {
                        categoryId:{
                            [db.Sequelize.Op.in]: categories
                        }
                    },
                },
                {
                    model: ProductImage,
                    required: false,
                    where: {
                        order: 0
                    }
                }
            ],
            order: sortingCmds,
            where:{
                price: {
                    [db.Sequelize.Op.between]: [priceStart-1, priceEnd+1]
                },
                name: {
                    [db.Sequelize.Op.like]: `%${productName}%`
                }
            }
        });
        return res.status(200).json({
            statusMessage: 'Product search returned.',
            products: products.toJSON()
        })
    }catch(e){
        next(e);
    }
}

exports.downloadDigital = async(req, res, next) => {
    const token = req.headers.DigitalAccess;
    if(res.locals.role !== 'SuperAdmin' && isUndefinedOrNullOrEmpty(token)){
        throw Error();
    }
    if(res.locals.role !== 'SuperAdmin' && isUndefinedOrNullOrEmpty(req.query.orderId)){
        throw Error();
    }
    try{
        if(res.locals.role === 'SuperAdmin'){
            const product = await Product.findOne({
                where: {
                    productId: req.params.id
                }
            })
            return res.status(200).download(product.digitalPath);
        }
        const orderProduct = await OrderProduct.findOne({
            where: {
                orderId: req.query.orderId,
                productId: req.params.id,
                downloadsRemaining: {
                    [db.sequelize.Op.gt]: 0
                }
            },
            include: Product,
            raw: true
        });
        if(!orderProduct){
            throw Error();
        }
        const verifyPromise = new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded)=>{
                if (err) reject(err);
                else resolve(decoded)
            });
        });
        orderProduct.downloadsRemaining = orderProduct.downloadsRemaining - 1;
        await orderProduct.save();
        const verifiedToken = await verifyPromise;
        if(verifiedToken){
            return res.status(200).download(orderProduct.Product.digitalPath);
        }
        throw Error();
    }catch(e){
        return res.status(403).json({
            type: 'AuthorizationError',
            statusMessage: 'You are not authorized to view this resource.'
        });
    }
}