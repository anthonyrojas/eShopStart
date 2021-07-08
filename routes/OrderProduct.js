const Auth = require('../middleware/auth');
const OrderProductController = require('../controllers/OrderProductController');

module.exports = (router) => {
    router.get('/digital-token/:orderId/:productId', Auth.validateToken, OrderProductController.requestDigitalProductAccess);
    router.put('/status/:id', Auth.validateToken, OrderProductController.updateOrderProduct);
}