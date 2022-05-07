const express = require('express');
const router = express.Router();
const {registerUser} = require('../../services/user_service');



router.post('/user/register', (req, res,next) => {
  registerUser(req, res, next);
});


router.get('/user/search/:id', function(req, res) {
  res.send('최근검색어 5개 조회');
});

module.exports = router;
