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
        address: req.body.address
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
        address: req.body.address
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

const checkExistedUser = async(req, res, next) => {
    if(findUser(req,res,next)) {
        return res.json({ message : 'existed'});
    }

    return res.json({ message : 'not existed'});
}

module.exports = {registerUser, login, setUserTown, checkExistedUser};