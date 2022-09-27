const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {User} = require('../models');
const crypto = require('crypto');
const moment = require("moment");

const registerUser = async (req, res, next) => {

    let existedUser = await findUser(req, res, next);
  
    if(existedUser) {
        return res.json({
            message: 'user already existed'
        });
    }

    await User.create({
        phone_number: req.body.phone_number,
        password: hashPassword(req.body.password),
        nickname: req.body.nickname,
        coupon_count : 0,
        penalty: false

    }).then(() => {
        return res.status(200).json({message : 'account created'});
    }).catch((err) => {
        return next(httpError(500, 'Server Error'));
    });
}

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('base64');
}

const findUser = async (req, res, next) => {
    let user = await User.findOne({
        where: {
            phone_number: req.body.phone_number,
            password: hashPassword(req.body.password)}
    }).catch((err) => {
        return next(err);
    });

    console.log(user);

    if (user?.penalty) {
        if(moment().isAfter(user?.penalty_date)){
            user.penalty = false;
            await user.save();
            return user;
        }else{
            return res.json({
                message: '패널티를 받은 사용자는 일정시간 사용불가 합니다'
            })
        }
    }else{
        return user;
    }
}


const login = async (req, res, next) => {
    let authenticatedUser = await findUser(req, res, next);

    if(authenticatedUser) {
        const jwtToken = await jwt.sign(authenticatedUser);
        return res.status(200).json({
            user: authenticatedUser,
            token: jwtToken
        });
    }

    return next(httpError(400, 'UnAuthorized User Request'));
}

const setUserTown = async (req, res, next) => {
    const jwtToken = req.header('token');
    const user = await jwt.verify(jwtToken);

    await User.update({
        self_posx: req.body.self_posx,
        self_posy: req.body.self_posy
    },{
        where:{
            user_id : user.id
        }
    }).then((user) => {
        return res.status(200).end();
    }).catch((err) => {
        return next(httpError(500, 'Server Error'));
    });
}

const checkDuplicatePhoneNumber = async(req, res, next) => {
    let duplicatedUser = await User.findOne({
        where: {
            phone_number: req.body.phone_number,
        }
    }).catch((err) => {
        return next(err);
    });

    if(duplicatedUser) {
        return res.json({ message : 'existed'})
    }

    return res.json({ message : 'not existed'})
}

module.exports = {registerUser, login, setUserTown, checkDuplicatePhoneNumber};
