/* u사용자 데이터를 불러오는 파일 */
var express = require('express');
const { render } = require('../app');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const title = '달대표의 시작'
  //res.send('respond with a resource');
  res.render('index',{title:title});
});

router.post('/register', function(req, res) {
  res.send('회원가입');
});

router.get('/register', function(req, res) {
  res.send('register page');
});
router.get('/main', function(req, res) {
  res.send('달대표 구하는 게시글 전부 표시');
});

router.get('/search', function(req, res) {
  res.send('최근검색어 5개');  // 검색은 post 아닌지...????????
});

router.get('/info/:id', function(req, res) {
  const myid = req.params.id
  res.send('myinfofo');
});


module.exports = router;
