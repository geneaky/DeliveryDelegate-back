const express = require('express');
const reviewService = require('../../services/review_service');
const router = express.Router();


router.post('/:storeid/post', async function(req, res, next) {
    reviewService.writwReview(req, res, next);
});

router.post('/:storeid/reciept', function(req, res, next) {
    reviewService.recieptAuth(req, res, next);
});


router.get('/:storeid/thumb', async function(req, res, next) {
    reviewService.thumbUp(req, res, next);
});



module.exports = router;