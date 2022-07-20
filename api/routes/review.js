const express = require('express');
const reviewService = require('../../services/review_service');
const router = express.Router();
const multer = require('multer');
const ocr_storage = multer.diskStorage({
    destination:  (req, file, cb) => {
      cb(null, 'ocr_uploads/')
    },
    filename:  (req, file, cb) => {
      cb(null, "recieptTest."+file.mimetype.split('/')[1])
    }
  })
const review_storage = multer.diskStorage({
    destination:  (req, file, cb) => {
      cb(null, 'review_uploads/')
    },
    filename:  (req, file, cb) => {
      cb(null, "reviewImage-"+new Date().valueOf()+"."+file.mimetype.split('/')[1])
    }
  })

const ocr_upload = multer({ storage: ocr_storage }); 
const review_upload = multer({ storage: review_storage }); 

router.post('/post', review_upload.single('file'), async function(req, res, next) {
    reviewService.writeReview(req, res, next);
});

router.get('/list', function(req, res, next) { 
  reviewService.allReview(req, res, next);
});

router.post('/reciept',  ocr_upload.single('file'), function(req, res, next) { 
    reviewService.recieptAuth(req, res, next);
});


router.post('/thumb', async function(req, res, next) {
    reviewService.thumbUp(req, res, next);
});



module.exports = router;