const express = require('express');
const UserRouter = express.Router();
const UserRoutes = require('./User')

const ProductRouter = express.Router();
const ProductRoutes = require('./Product');

const CategoryRouter = express.Router();
const CategoryRoutes = require('./Category');

module.exports = (app) => {
    app.get('/', (req, res)=>{
        return res.status(200).send('EShopStart is alive.');
    })
    app.use('/api/user', UserRouter);
    UserRoutes(UserRouter);

    app.use('/api/product', ProductRouter);
    ProductRoutes(ProductRouter);

    app.use('/api/category', CategoryRouter);
    CategoryRoutes(CategoryRouter);
}