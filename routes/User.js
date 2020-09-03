const Auth = require('../middleware/auth');
const UserController = require('../controllers/UserController');
module.exports = (router) => {
    router.get('/', Auth.validateToken, UserController.getUser);
    router.get('/all', Auth.validateToken, UserController.getUsers);
    router.get('/:id', Auth.validateToken, UserController.getUser);
    router.post('/', UserController.addAccount);
    router.post('/admin', Auth.validateToken, UserController.addAccount);
    router.put('/', Auth.validateToken, UserController.updateUser);
    router.put('/password', Auth.validateToken, UserController.updateUser);
    router.post('/login', UserController.beginLogin, Auth.generateToken, UserController.completeLogin);
}