/* [/user/...] 사용자 데이터를 불러오는 파일 */
const express = require('express');
const userService = require('../../services/user_service');
const router = express.Router();



router.post('/register', function(req, res, next) {
  userService.registerUser(req, res, next);
});

router.post('/login', function(req, res) {
  userService.login(req, res, next);
});


module.exports = router;


/*
router.get('/user/search/:id', function(req, res) {
  res.send('최근검색어 5개 조회'); 

});


router.get('/user/info/:id', async function(req, res) {
  const myid = parseInt(req.params.id);
  try{
    console.log("my information");
    const find = await User.findAll({
      attributes: ['user_id', 'self_xpos','self_ypos'],
      where: { 
        user_id: myid,
      },
    });
    console.log(find); //
  }catch(err){
    console.error(err);
    next(err)
  }
});


router.get('/user/info/:id/detail', function(req, res) {
  const myid = req.params.id
  res.send('내가 작성한 게시글 목록, 리뷰 목록 표시');
});
*/