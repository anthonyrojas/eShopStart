const Auth = require('../middleware/auth');
const CategoryController = require('../controllers/CategoryController');

module.exports = (router) => {
    router.post('/', Auth.validateToken, CategoryController.addCategory);
    router.put('/:id', Auth.validateToken, CategoryController.updateCategory);
    router.get('/:id', CategoryController.getCategory);
    router.get('/', CategoryController.getCategories);
    router.delete('/:id', Auth.validateToken, CategoryController.deleteCategory);
}