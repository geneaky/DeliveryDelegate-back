const express = require('express');
const reviewService = require('../../services/review_service');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination:  (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename:  (req, file, cb) => {
      cb(null, "recieptTest."+file.mimetype.split('/')[1])// 파일 원본이름 저장
    }
  })

const upload = multer({ storage: storage }); 

router.post('/post', async function(req, res, next) {
    reviewService.writwReview(req, res, next);
});

router.post('/reciept',  upload.single('file'), function(req, res, next) { //
    console.log("multer됨");
    reviewService.recieptAuth(req, res, next);
});


router.get('/thumb', async function(req, res, next) {
    reviewService.thumbUp(req, res, next);
});



module.exports = router;