const Auth = require('../middleware/auth');
const AppSettingController = require('../controllers/AppSettingController');

module.exports = (router) => {
    router.post('/', Auth.validateToken, AppSettingController.addAppSetting);
    router.put('/:id', Auth.validateToken, AppSettingController.updateAppSetting);
    router.get('/', Auth.validateToken, AppSettingController.getAppSettings);
    router.get('/:id', Auth.validateToken, AppSettingController.getAppSetting);
    router.get('/categories', Auth.validateToken, AppSettingController.getAppSettingCategories);
}