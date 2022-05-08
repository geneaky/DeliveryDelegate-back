const httpError = require('http-errors');
const {User} = require('../models');
const crypto = require('crypto');

// 회원가입
const registerUser = async (req, res, next) => {
    let existedUser = await findUser(req, res, next, 0);

    if(existedUser) { 
        return res.json({
            message: 'user already existed'
        });
    }

    await User.create({
        phone_number: req.body.phone_number,
        password: hashPassword(req.body.password),
        self_xpos: req.body.xpos,
        self_ypos: req.body.ypos
    });

    res.status(200).json({message : 'account created'});
}

// 비밀번호 단방향 암호화 ( 알고리즘 : sha512, 인코딩 : base64 )
const hashPassword = (password) => {
    return crypto.createHash('sha512').update(password).digest('base64');
}

// (시퀄라이즈 조회) 존재하는 사용자인지 확인 
const findUser = async (req, res, next, code) => {
    if (code === 0){ // [code=0] 회원가입, 전화번호 조회(중복체크)
        return await User.findOne({
            where: { phone_number: req.body.phone_number }
        }).catch((err) => {
            next(err);
        });
    }
    else {
        return await User.findOne({ // [code=1] 로그인, 전화번호&비밀번호 조회
            where: {
                phone_number: req.body.phone_number,
                password: hashPassword(req.body.password)}
        }).catch((err) => {
            next(err);
        });
    }
};

// 로그인
const login = async (req, res, next) => {
    let authenticatedUser = await findUser(req, res, next, 1);
    console.log(authenticatedUser);
    if(authenticatedUser) {
        return res.status(200).json({
            user: authenticatedUser
        });
    }

    next(httpError(400, 'UnAuthorized User Request'));
}

module.exports = {registerUser, login};