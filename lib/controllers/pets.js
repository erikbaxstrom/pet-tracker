const { Router } = require('express');
const Pet = require('../models/Pets.js');

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const pet = await Pet.getPetById(req.params.id);
      res.json(pet);
    } catch (e) {
      next(e);
    }
  })

  .post('/', async (req, res, next) => {
    try {
      const newPet = await Pet.addNewPet({ ...req.body });
      await Pet.addPetRel(req.user.id, newPet.id);
      res.json(newPet);
    } catch (e) {
      next(e);
    }
  })

  .put('/:id', async (req, res, next) => {
    try {
      const pet = await Pet.updatePet(req.params.id, req.body);
      res.json(pet);
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
