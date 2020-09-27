const Auth = require('../middleware/auth');
const ProductController = require('../controllers/ProductController');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const storage = multer.diskStorage({
    fileFilter: function(req, file, cb){
        if(!file){
            return cb(null, false)
        }else{
            return cb(null, false);
        }
    },
    destination: function(req, file, cb){
        const uploadPath = 'products';
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb){
        let data = file.originalname + Date.now();
        crypto.createHash('md5').update(data).digest('hex');
        const filename = data.toLowerCase();
        const fileSplit = file.originalname.split(".");
        const fileExt = fileSplit[fileSplit.length - 1];
        cb(null, `${filename}.${fileExt}`);
    }
});
const upload = multer({storage: storage});

module.exports = (router) => {
    router.get('id/:id', ProductController.getProduct);
    router.post('/', Auth.validateToken, ProductController.addProduct);
    router.post('/digital', Auth.validateToken, upload.single('productFile'), ProductController.addProduct);
    router.put('/:id', Auth.validateToken, ProductController.updateProduct);
    router.put('/:id/digital', Auth.validateToken, ProductController.updateProduct);
    router.get('/', ProductController.getProducts);
    router.delete('/:id', Auth.validateToken, ProductController.deleteProduct);
    router.get('/:slug', ProductController.getProductBySlug);
    router.get('/search', ProductController.searchProducts);
}