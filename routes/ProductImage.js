const multer = require('multer');
const ProductImageController = require('../controllers/ProductImageController');
const fs = require('fs');
const Auth = require('../middleware/auth');
const crypto = require('crypto');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = `uploads/${req.params.productId}`;
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath)
    },
    filename: function(req, file, cb) {
        let data = file.originalname + Date.now();
        data = crypto.createHash('md5').update(data).digest('hex');
        const filename = data.toLowerCase();
        const fileSplit = file.originalname.split(".");
        const fileExt = fileSplit[fileSplit.length - 1];
        cb(null, `${filename}.${fileExt}`);
    }
});
const upload = multer({storage: storage});

module.exports = (router) => {
    router.post('/:productId', upload.single('productImage'), Auth.validateToken, ProductImageController.addProductImage);
    router.put('/:imageId', Auth.validateToken, ProductImageController.updateProductImage);
    router.put('/images/:productId', Auth.validateToken, ProductImageController.updateProductImages);
    router.delete('/:id', Auth.validateToken, ProductImageController.deleteProductImage);
}