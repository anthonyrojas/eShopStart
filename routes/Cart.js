const Auth = require('../middleware/auth');
const CartController = require('../controllers/CartController');
module.exports = (router) => {
    router.get('/', Auth.validateToken, CartController.getCart);
    router.put('/', Auth.validateToken, CartController.updateCartItems);
    router.post('/cart-item', Auth.validateToken, CartController.addCartItem);
    router.delete('/', Auth.validateToken, CartController.clearCart);
}