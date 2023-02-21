const { Router } = require('express');
const Pet = require('../models/pets.js');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    const response = await Pet.insert({ ...req.body });
    res.json(response);
  } catch (e) {
    next(e);
  }
});
