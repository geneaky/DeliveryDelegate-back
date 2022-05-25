const express = require('express');
const router = express.Router();
const userService = require('../../services/user_service');
const authenticate = require('../../api/middlewares/auth');



router.post('/register/existed', (req, res, next) => {
  userService.checkDuplicatePhoneNumber(req, res, next);
});

router.post('/register', (req, res,next) => {
  userService.registerUser(req, res, next);
});

router.post('/login', (req, res, next) => {
  userService.login(req, res, next);
})

router.post('/town', authenticate ,(req, res, next) => {
  userService.setUserTown(req, res, next);
})

module.exports = router;
