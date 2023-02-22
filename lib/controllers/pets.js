const { Router } = require('express');
const Pet = require('../models/Pets.js');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const newPet = await Pet.addNewPet({ ...req.body });
      await Pet.addPetRel(req.user.id, newPet.id);
      res.json(newPet);
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const pets = await Pet.getAllPets(req.user.id);
      res.json(pets);
    } catch (e) {
      next(e);
    }
  });
