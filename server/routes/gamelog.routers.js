const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams pour accéder à gameId
const GameLog = require('../models/Gamelog.model');

router.get('/', async (req, res, next) => {
  const { gameId } = req.params;

  try {
    const logs = await GameLog.find({ game: gameId });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { gameId } = req.params;
  const { actionType, cardDrawn, promptResponse, pisteFollowed } = req.body;

  try {
    const log = await GameLog.create({
      game: gameId,
      actionType,
      cardDrawn,
      promptResponse,
      pisteFollowed,
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
