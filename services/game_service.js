const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { v4 } = require('uuid');
const { Game, Delegator} = require('../models');

const createGame = async (req, res, next) => {
    const user = await jwt.verify(req.header('token'));

    const room_name = v4();

    const game = await Game.create({
        game_type: req.body.game_type,
        game_name: req.body.game_name,
        population: req.body.population,
        landmark_posx: req.body.landmark_posx,
        landmark_posy: req.body.landmark_posy,
        socket_room_name: room_name
    }).catch((err) => {
        return next(err);
    });

    const delegator = await Delegator.create({
        game_id: game.game_id,
        user_id: user.id
    }).catch((err) => {
        return next(err);
    });

    res.status(200).json({
        name: room_name,
        message: 'socket room created'
    });
}

const findGames = async (req, res, next) => {
    const user = await jwt.verify(req.header('token'));

    const games = await Game.findAll().catch((err) => {
        return next(err);
    })

    res.status(200).json({
        games: games
    });
}

module.exports = { createGame, findGames }