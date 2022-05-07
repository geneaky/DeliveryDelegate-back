const {User} = require('../models');
const crypto = require('crypto');

const registerUser = async (req, res, next) => {
    let user = await User.create({
        phone_number: req.body.phone_number,
        password: crypto.createHash('sha256').update(req.body.password).digest('base64'),
        self_xpos: req.body.xpos,
        self_ypos: req.body.ypos
    });

    res.status(200).json({message : 'account created'});
}

module.exports = {registerUser};