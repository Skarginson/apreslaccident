const express = require('express');
const router = express.Router();
const Game = require('../models/Game.model');
const Card = require('../models/Card.model');
const GameLog = require('../models/Gamelog.model');
const { handleNotFound, shuffleArray } = require('../utils');
const protectionMiddleware = require('../middleware/protection.middleware');

// Managing the ongoing game

// Endpoint to initialize a new game
router.post('/:gameId/initialize', async (req, res, next) => {
  const { gameId } = req.params;

  try {
    // Retrieve the game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if the game is already initialized
    if (game.isInitialized) {
      return res.status(400).json({ message: 'Game is already initialized' });
    }

    // Prepare card decks for each act
    const cards = await Card.find({
      $or: [
        { type: 'coeur' },
        { type: 'carreau' },
        { type: 'trefle' },
        { type: 'pique', value: { $gte: 2, $lte: 10 } },
        { type: 'pique', value: { $in: [1, 11, 12, 13] } },
      ],
    });

    const coeurCards = cards.filter((card) => card.type === 'coeur');
    const carreauCards = cards.filter((card) => card.type === 'carreau');
    const trefleCards = cards.filter((card) => card.type === 'trefle');
    const piqueCards = cards.filter(
      (card) => card.type === 'pique' && card.value >= 2 && card.value <= 10
    );
    const piqueFigures = cards.filter(
      (card) => card.type === 'pique' && [1, 11, 12, 13].includes(card.value)
    );

    // Shuffle the cards and create the decks
    const shuffledCoeur = shuffleArray(coeurCards).slice(0, 6);
    const shuffledCarreau = shuffleArray(carreauCards).slice(0, 7);
    const shuffledTrefle = shuffleArray(trefleCards).slice(0, 6);
    const shuffledPiqueFigures = shuffleArray(piqueFigures);

    // Create the History deck
    const historyDeck = [
      ...shuffledCoeur,
      ...shuffledCarreau,
      ...shuffledTrefle,
      ...shuffledPiqueFigures,
    ];

    // Shuffle the History deck
    const shuffledHistoryDeck = shuffleArray(historyDeck);

    // Update the game with the decks
    game.deck = {
      coeur: shuffledCoeur,
      carreau: shuffledCarreau,
      trefle: shuffledTrefle,
      history: shuffledHistoryDeck,
      pistes: piqueCards,
      figures: shuffledPiqueFigures,
    };
    game.isInitialized = true;
    await game.save();

    res
      .status(200)
      .json({ message: 'Game initialized successfully', deck: game.deck });
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

// Create a new game
router.post('/', async (req, res, next) => {
  const { userId } = req.body;

  // Validate userId
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'Invalid or missing userId' });
  }

  try {
    const newGame = await Game.create({ userId });
    res.status(201).json(newGame);
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
