const express = require('express');
const UserRouter = express.Router();
const UserRoutes = require('./User')

const ProductRouter = express.Router();
const ProductRoutes = require('./Product');

const CategoryRouter = express.Router();
const CategoryRoutes = require('./Category');

const InventoryRouter = express.Router();
const InventoryRoutes = require('./Inventory');

const ProductCategoryRouter = express.Router();
const ProductCategoryRoutes = require('./ProductCategory');

const ProductImageRouter = express.Router();
const ProductImageRoutes = require('./ProductImage');

const OrderRouter = express.Router();
const OrderRoutes = require('./Order');

const CartRouter = express.Router();
const CartRoutes = require('./Cart');

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

    app.use('/api/inventory', InventoryRouter);
    InventoryRoutes(InventoryRouter);

    app.use('/api/product-category', ProductCategoryRouter);
    ProductCategoryRoutes(ProductCategoryRouter);

    app.use('/api/product-image', ProductImageRouter);
    ProductImageRoutes(ProductImageRouter);

    app.use('/api/order', OrderRouter);
    OrderRoutes(OrderRouter);

    app.use('/api/cart', CartRouter);
    CartRoutes(CartRouter);
}