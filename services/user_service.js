const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {User} = require('../models');
const crypto = require('crypto');

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
        self_xpos: req.body.xpos,
        self_ypos: req.body.ypos
    });

    res.status(200).json({message : 'account created'});
}

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('base64');
}

const findUser = async (req, res, next) => {
    return await User.findOne({
        where: {
            phone_number: req.body.phone_number,
            password: hashPassword(req.body.password)}
    }).catch((err) => {
        next(err);
    });
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

    next(httpError(400, 'UnAuthorized User Request'));
}

const setUserTown = async (req, res, next) => {
    const jwtToken = req.header('token');
    const user = await jwt.verify(jwtToken);

    User.update({
        self_xpos: req.body.posx,
        self_ypos: req.body.posy
    },{
        where:{
            user_id : user.id
        }
    }).then((user) => {
        return res.status(200).end();
    }).catch((err) => {
        next(httpError(500, 'Server Error'));
    });
}

module.exports = {registerUser, login, setUserTown};