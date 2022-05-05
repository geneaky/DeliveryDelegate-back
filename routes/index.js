/* root 라우터를 불러오는 파일 */
const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {
  const title = '달대표의 시작'
  //res.send('respond with a resource');
  res.render('index',{title:title});
});


router.get('/main', function(req, res) {
  res.send('달대표 구하는 게시글 전부 표시');
});


module.exports = router;
