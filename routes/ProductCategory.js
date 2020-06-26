const Auth = require('../middleware/auth');
const ProductCategoryController = require('../controllers/ProductCategoryController');

module.exports = (router) => {
    router.post('/category-to-product', Auth.validateToken, ProductCategoryController.addProductCategory);
    router.post('/product-to-category', Auth.validateToken, ProductCategoryController.addCategoryProduct);
    router.put('/products-to-category', Auth.validateToken, ProductCategoryController.updateCategoryProducts);
    router.put('/categories-to-product', Auth.validateToken, ProductCategoryController.updateProductCategories);
    router.get('/product-categories/:productId', ProductCategoryController.getProductCategories);
    router.get('/category-products/:categoryId', ProductCategoryController.getCategoryProducts);
    router.delete('/category-from-product', Auth.validateToken, ProductCategoryController.removeCategoryFromProduct);
    router.delete('/product-from-category', Auth.validateToken, ProductCategoryController.removeProductFromCategory);
}