const Auth = require('../middleware/auth');
const OrderController = require('../controllers/OrderController');
const ShipmentController = require('../controllers/ShipmentController');
const CartController = require('../controllers/CartController');
module.exports = (router) => {
    router.get('/single/:id', Auth.validateToken, OrderController.getOrder);
    router.get('/all/:userId?', Auth.validateToken, OrderController.getOrders);
    router.post('/checkout', Auth.validateToken, CartController.calculateSubTotal, OrderController.beginCheckout, ShipmentController.generateShippingLabel, OrderController.completeCheckout);
    router.post('/process', OrderController.processOrder);
}