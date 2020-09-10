const Auth = require('../middleware/auth');
const ShippingAddressController = require('../controllers/ShippingAddressController');

module.exports = (router) => {
    router.post('/', Auth.validateToken, ShippingAddressController.addShippingAddress);
    router.post('/:id', Auth.validateToken, ShippingAddressController.updateShippingAddress);
    router.get('/', Auth.validateToken, ShippingAddressController.getShippingAddresses);
    router.get('/user/:userId', Auth.validateToken, ShippingAddressController.getShippingAddresses);
    router.get('/:id', Auth.validateToken, ShippingAddressController.getShippingAddress);
    router.delete('/:id', Auth.validateToken, ShippingAddressController.deleteShippingAddress);
}