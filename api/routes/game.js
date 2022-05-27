const express = require('express');
const router = express.Router();
const gameService = require('../../services/game_service');

router.post('/register', (req, res, next) => {
    gameService.createGame(req, res, next);
});

module.exports = router;