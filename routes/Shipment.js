const Auth = require('../middleware/auth');
const ShipmentController = require('../controllers/ShipmentController');
const CartController = require('../controllers/CartController');
module.exports = (router) => {
    router.post('/validate-address', Auth.validateToken, ShipmentController.validateAddress);
    router.post('/rates', Auth.validateToken, CartController.calculatePackageDimensions, ShipmentController.calculateShippingRates);
}