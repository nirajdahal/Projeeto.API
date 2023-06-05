const multer = require('multer')
// Set up storage for uploaded files using Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // specify the directory where the uploaded files will be stored
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        // specify the filename of the uploaded file
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// Create a Multer object using the storage configuration and set additional options
const uploadFunc = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1 // 1 MB
    }
})
module.exports = uploadFunc;