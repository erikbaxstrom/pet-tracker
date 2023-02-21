const { Router } = require('express');
const Pet = require('../models/pets.js');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const response = await Pet.insert({ ...req.body });
      res.json(response);
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const pets = await Pet.getAllPets(req.body);
      console.log(pets);
      res.json(pets);
    } catch (e) {
      next(e);
    }
  });
