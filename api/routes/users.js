/* 사용자 데이터를 불러오는 파일 */
const express = require('express');
const router = express.Router();



router.post('/user/register', function(req, res) {
  res.send('회원가입');
});


router.get('/user/search/:id', function(req, res) {
  res.send('최근검색어 5개 조회');  // 검색은 post 아닌지...????????
});

module.exports = router;
