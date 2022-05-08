/* 사용자 데이터를 불러오는 파일 */
const express = require('express');
const { nextTick } = require('process');
const {User} = require('../models')
const router = express.Router();



router.get('/user/register', async function(req, res, next) {
  try{
    //안됨
    console.log("등장");
    const user = await User.create({
      phone_number : '010',
      name : "dddd",
      password : 'passwwww',
      self_xpos : '127.12',
      self_ypos : '37' 
    });
    console.log(user);
  }catch(err){
    console.error(err);
    next(err)
  }
});

router.get('/user/search/:id', function(req, res) {
  res.send('최근검색어 5개 조회'); 
});
router.post('/user/search/:id', function(req, res) {
  res.send('검색'); 
});


router.get('/user/info/:id', function(req, res) {
  const myid = req.params.id
  res.send('myinfofo');
});


router.get('/user/info/:id/detail', function(req, res) {
  const myid = req.params.id
  res.send('내가 작성한 게시글 목록, 리뷰 목록 표시');
});

module.exports = router;
