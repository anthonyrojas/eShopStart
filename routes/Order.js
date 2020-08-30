const Auth = require('../middleware/auth');
const OrderController = require('../controllers/OrderController');
module.exports = (router) => {
    router.get('/single/:id', Auth.validateToken, OrderController.getOrder);
    router.get('/all/:userId?', Auth.validateToken, OrderController.getOrders);
    router.post('/', Auth.validateToken, OrderController.addOrder);
    router.post('/process', OrderController.orderProcessed);
}