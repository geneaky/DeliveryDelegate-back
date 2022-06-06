const express = require('express');
const reviewService = require('../../services/review_service');
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, '../../public');
      },
      filename: function (req, file, cb) {
        cb(null, "recieptTest");
      }
    }),
  });

router.post('/post', async function(req, res, next) {
    reviewService.writwReview(req, res, next);
});

router.post('/reciept',  upload.single('file'), function(req, res, next) { //
    reviewService.recieptAuth(req, res, next);
});


router.get('/thumb', async function(req, res, next) {
    reviewService.thumbUp(req, res, next);
});



module.exports = router;