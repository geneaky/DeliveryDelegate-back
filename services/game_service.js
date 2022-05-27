const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const {User, Game} = require('../models');

const createGame = async (req, res, next) => {
    // const user = await jwt.verify(req.header('token'));

    const game = await Game.create({
        game_type: req.body.game_type,
        game_name: req.body.game_name,
        population: req.body.population,
        landmark_posx: req.body.landmark_posx,
        landmark_posy: req.body.landmark_posy
    });


    res.status(200).end();
}

module.exports = { createGame }