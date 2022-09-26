const express = require('express');
const myPageService = require('../../services/myPage_service')
const router = express.Router();


router.get('/', function(req, res, next) {
  myPageService.viewMyPage(req, res, next);
});


router.get('/reviews', function(req, res, next) {
  myPageService.viewMyReviewPage(req, res, next);
});

router.post('/update', function(req, res, next) { 
  myPageService.updateUserInfo(req, res, next);
});




module.exports = router;