const express = require('express');
const router = express.Router();
const storeService = require('../../services/store_service');

router.get('/',(req,res,next) => {
    res.json({
        test: "success"
    })
});

router.post('/register', (req, res, next) => {
    storeService.registerStore(req, res, next);
});

router.get('/:id/reviews', (req, res, next) => {
    storeService.getReviews(req, res, next);
})

module.exports = router;