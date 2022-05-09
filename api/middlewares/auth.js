const jwt = require('./jwt');
const httpError = require("http-errors");
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const authenticate = async (req, res, next) => {
    let jwtToken = req.header('token');

    if(!jwtToken) {
        next(httpError(400, 'UnAuthorized User Request'));
    }

    const user = await jwt.verify(jwtToken);

    if(user === TOKEN_EXPIRED) {
        next(httpError(400, 'Authentication Expired!'));
    } else if (user === TOKEN_INVALID) {
        next(httpError(400, 'UnAuthorized User Request'));
    }

    next();
}

module.exports = authenticate;