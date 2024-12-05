const express = require('express');
const router = express.Router();
const Game = require('../models/Game.model');
const Card = require('../models/Card.model');
const GameLog = require('../models/Gamelog.model');
const { handleNotFound, shuffleArray } = require('../utils');
const protectionMiddleware = require('../middleware/protection.middleware');

// Managing the ongoing game

// Endpoint to initialize a new game
router.post('/launch-game', async (req, res, next) => {
  const { userId, name } = req.body;

  try {
    // Create a new game
    const newGame = await Game.create({ userId, name });

    // Prep the deck
    const cards = await Card.find({
      $or: [
        { type: 'coeur' },
        { type: 'carreau' },
        { type: 'trefle' },
        { type: 'pique', value: { $gte: 2, $lte: 10 } },
        { type: 'pique', value: { $in: [1, 11, 12, 13] } },
      ],
    });

    const coeurCards = shuffleArray(
      cards.filter((c) => c.type === 'coeur')
    ).slice(0, 6);
    const carreauCards = shuffleArray(
      cards.filter((c) => c.type === 'carreau')
    ).slice(0, 7);
    const trefleCards = shuffleArray(
      cards.filter((c) => c.type === 'trefle')
    ).slice(0, 6);
    const piqueCards = shuffleArray(
      cards.filter((c) => c.type === 'pique' && c.value >= 2 && c.value <= 10)
    );
    const piqueFigures = shuffleArray(
      cards.filter(
        (c) => c.type === 'pique' && [1, 11, 12, 13].includes(c.value)
      )
    );

    newGame.deck = {
      coeur: coeurCards,
      carreau: carreauCards,
      trefle: trefleCards,
      history: [
        ...coeurCards,
        ...carreauCards,
        ...trefleCards,
        ...piqueFigures,
      ],
      pistes: piqueCards,
      figures: piqueFigures,
    };
    newGame.isInitialized = true;

    await newGame.save();

    res.status(201).json({ message: 'Game initialized successfully', newGame });
  } catch (err) {
    next(err);
  }
});

// Protect the following routes with middleware
// router.use(protectionMiddleware);

router.get('/', async (_, res, next) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const game = await Game.findById(id);
    if (!game) {
      handleNotFound(res);
      return;
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedGame = await Game.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedGame) {
      handleNotFound(res);
      return;
    }

    res.json(updatedGame);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const game = await Game.findByIdAndDelete(id);
    if (!game) {
      handleNotFound(res);
      return;
    }
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
