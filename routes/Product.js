const Auth = require('../middleware/auth');
const ProductController = require('../controllers/ProductController');
module.exports = (router) => {
    router.get('id/:id', ProductController.getProduct);
    router.post('/', Auth.validateToken, ProductController.addProduct);
    router.put('/:id', Auth.validateToken, ProductController.updateProduct);
    router.get('/', ProductController.getProducts);
    router.delete('/:id', Auth.validateToken, ProductController.deleteProduct);
    router.get('/:slug', ProductController.getProductBySlug);
    router.get('/search', ProductController.searchProducts);
}