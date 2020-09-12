const Auth = require('../middleware/auth');
const ShippingAddressController = require('../controllers/AppSettingController');

module.exports = (router) => {
    router.post('', Auth.validateToken, ShippingAddressController.addAppSetting);
    router.put('/:id', Auth.validateToken, ShippingAddressController.updateAppSetting);
    router.get('', Auth.validateToken, ShippingAddressController.getAppSettings);
    router.get('/:id', Auth.validateToken, ShippingAddressController.getAppSetting);
    router.get('/categories', Auth.validateToken, ShippingAddressController.getAppSettingCategories);
}