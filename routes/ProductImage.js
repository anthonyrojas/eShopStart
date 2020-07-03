const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const ProductImageController = require('../controllers/ProductImageController');
const fs = require('fs');
const Auth = require('../middleware/auth');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadPath = `uploads/${req.params.productId}`;
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath)
    },
    filename: function(req, file, cb) {
        const uuidFilename = uuidv4();
        const filename = uuidFilename.split("-")[4];
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