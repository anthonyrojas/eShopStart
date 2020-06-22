const Auth = require('../middleware/auth');
const InventoryController = require('../controllers/InventoryController');
module.exports = (router) => {
    router.post('/', Auth.validateToken, InventoryController.addInventory);
    router.put('/:productId', Auth.validateToken, InventoryController.updateInventory);
    router.get('/:productId', InventoryController.getInventory)
}