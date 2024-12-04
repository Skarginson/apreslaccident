const express = require('express');
const router = express.Router();
const Game = require('../models/Game.model');
const { handleNotFound } = require('../utils');
const protectionMiddleware = require('../middleware/protection.middleware');

// Protéger les routes suivantes avec le middleware (si nécessaire)
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
