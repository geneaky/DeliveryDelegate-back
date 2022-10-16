const httpError = require('http-errors');
const jwt = require('../api/middlewares/jwt');
const { v4 } = require('uuid');
const { Game, Delegator, Order, User} = require('../models');
const {Op} = require("sequelize");

const createGame = async (req, res, next) => {
    const user = await jwt.verify(req.header('token'));

    const room_name = v4();

    const game = await Game.create({
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

    const posx = userModel.self_posx;
    const posy = userModel.self_posy;

    if(!userModel.self_posx || !userModel.self_posy) {
        res.status(400).json({ message: '동네 설정을 해주세요'});
        return;
    }

    function getDistance(lat1, lon1, lat2, lon2) {
        if ((lat1 == lat2) && (lon1 == lon2))
            return 0;

        let radLat1 = Math.PI * lat1 / 180;
        let radLat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radTheta = Math.PI * theta / 180;
        let dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1)
            dist = 1;

        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344 * 1000;
        if (dist < 100) dist = Math.round(dist / 10) * 10;
        else dist = Math.round(dist / 100) * 100;

        return dist;
    }

    const games = await Game.findAll().catch((err) => {
        console.log(err)
    })

    let result = games.filter((g) => {
        if(getDistance(Number(posx),Number(posy), Number(g?.landmark_posx), Number(g?.landmark_posy)) <= 500) {
            return true;
        }
        return false;
    });

    res.status(200).json({
        games: result
    })

}

module.exports = { createGame, findGames, searchGames }