const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { v4 } = require('uuid');
const { Game, Delegator, Order} = require('../models');
const {Op} = require("sequelize");

const createGame = async (req, res, next) => {
    const user = await jwt.verify(req.header('token'));

    const room_name = v4();

    const game = await Game.create({
        game_type: req.body.game_type,
        game_name: req.body.game_name,
        game_main_text: req.body?.game_main_text,
        population: req.body.population,
        landmark_name: req.body.landmark_name,
        landmark_posx: req.body.landmark_posx,
        landmark_posy: req.body.landmark_posy,
        socket_room_name: room_name
    }).catch((err) => {
        return next(err);
    });

    const delegator = await Delegator.create({
        game_id: game.game_id,
        user_id: user.id,
        ranking: 1 //방장의 경우 처음 랭킹 1을 할당
    }).catch((err) => {
        return next(err);
    });

    await Order.create({
        delegator_id: delegator.delegator_id,
        store_name: req.body.order.store_name,
        mapx: req.body.order.mapx,
        mapy: req.body.order.mapy,
        detail: req.body.order.detail,
    }).catch((err) => {
        return next(err);
    })

    res.status(200).json({
        name: room_name,
        game_id: game.game_id,
        message: 'socket room created'
    });
}

const findGames = async (req, res, next) => {

    const games = await Game.findAll().catch((err) => {
        return next(err);
    })

    res.status(200).json({
        games: games
    });
}

const searchGames = async (req, res, next) => {

    const user = await jwt.verify(req.header('token'));

    let userModel = await User.findOne({
        user_id: user.id
    });

    //내 주위 반경 1km로 검색 default
    const long = 0.0113 //경도 1km x
    const latt = 0.0091 // 위도 1km y

    let min_x = Number(userModel.self_posx) - long;
    let max_x = Number(userModel.self_posx) + long;

    let min_y = Number(userModel.self_posy) - latt;
    let max_y = Number(userModel.self_posy) + latt;

    const games = await Game.findAll({
        where: {
            landmark_posx: { [Op.between] : [min_x, max_x]},
            landmark_posy: { [Op.between] : [min_y, max_y]}
        }
    }).catch((err) => {
        console.log(err)
    })

    res.status(200).json({
        games: games
    })

}

module.exports = { createGame, findGames, searchGames }