/* [/review/...] 리뷰작성 및 조회 */
const express = require('express');
const reviewService = require('../../services/review_service');
const router = express.Router();


// 리뷰 등록 버튼 (store 추가 기능은 X)
router.post('/:storeid/post', async function(req, res, next) {
    reviewService.writwReview(req, res, next);
});

// 영수증 검증 버튼 
router.post('/:storeid/reciept', function(req, res, next) {
    reviewService.recieptAuth(req, res, next);
});

// 좋아요 버튼
router.get('/:storeid/thumb', async function(req, res, next) {
    reviewService.thumbUp(req, res, next);
});





module.exports = router;