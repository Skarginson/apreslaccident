const express = require('express');
const router = express.Router();
const Card = require('../models/Card.model');
const { handleNotFound } = require('../utils');

router.get('/', async (_, res, next) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const card = await Card.findById(id);
    if (!card) {
      handleNotFound(res);
      return;
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
