const { Router } = require('express');
const Pet = require('../models/pets.js');

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const response = await Pet.addNewPet({ ...req.body });
      console.log('req.user.id!!!', req.user.id);
      console.log('response.id~~~', response.id);
      await Pet.addPetRel(req.user.id, response.id);
      res.json(response);
    } catch (e) {
      next(e);
    }
  })
  // .post('/pets', async (req, res, next) => {
  //   try {
  //     const response = await Pet.addPetRel(req.user.id, req.pet.id);
  //     res.json(response);
  //   } catch (e) {
  //     next(e);
  //   }
  // })

  .get('/', async (req, res, next) => {
    try {
      const pets = await Pet.getAllPets(req.user.id);
      res.json(pets);
    } catch (e) {
      next(e);
    }
  });
