const express = require('express');
const router = express.Router();
const Piste = require('../models/Piste.model');
const { handleNotFound } = require('../utils');

router.get('/', async (_, res, next) => {
  try {
    const pistes = await Piste.find();
    res.json(pistes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const piste = await Piste.findById(id);
    if (!piste) {
      handleNotFound(res);
      return;
    }
    res.json(piste);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
