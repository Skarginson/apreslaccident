const express = require('express');
const router = express.Router();
const Game = require('../models/Game.model');
const Card = require('../models/Card.model');
const GameLog = require('../models/Gamelog.model');
const { handleNotFound } = require('../utils');
const protectionMiddleware = require('../middleware/protection.middleware');

// Protéger les routes suivantes avec le middleware
// router.use(protectionMiddleware);

// Tirage de carte
router.post('/:gameId/draw', async (req, res, next) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const currentAct = game.currentAct;
    const actDeck = game.deck[currentAct];

    if (actDeck.length === 0) {
      return res
        .status(400)
        .json({ message: 'No more cards in the deck for this act' });
    }

    // Tirer la première carte du deck
    const drawnCard = actDeck.shift();
    game.lastPlayedCard = drawnCard;
    await game.save();

    // Ajouter un log pour le tirage
    const log = await GameLog.create({
      game: gameId,
      actionType: 'draw',
      cardDrawn: drawnCard,
    });

    res.status(200).json({ card: drawnCard, log });
  } catch (err) {
    next(err);
  }
});

// Suivre une piste
router.post('/:gameId/follow', async (req, res, next) => {
  const { gameId } = req.params;
  const { pisteId } = req.body;

  try {
    // Vérifier si la partie existe
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Ajouter la piste suivie aux logs
    const log = await GameLog.create({
      game: gameId,
      actionType: 'follow',
      pisteFollowed: pisteId,
    });

    res.status(200).json({ message: 'Piste suivie enregistrée', log });
  } catch (err) {
    next(err);
  }
});

// Progression dans les actes
router.patch('/:gameId/progress', async (req, res, next) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Passer à l'acte suivant
    if (game.currentAct < 3) {
      game.currentAct += 1;
      await game.save();
      res
        .status(200)
        .json({ message: 'Act progressed', currentAct: game.currentAct });
    } else {
      res.status(400).json({ message: 'Already at the final act' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;

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

// Créer une nouvelle partie
router.post('/', async (req, res, next) => {
  const { userId } = req.body;

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
    await Game.findByIdAndDelete(id);
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
