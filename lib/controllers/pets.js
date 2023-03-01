const { Router } = require('express');
const Pet = require('../models/Pets.js');
const User = require('../models/User.js');
const authorizeOwner = require('../middleware/authorizeOwner.js');

module.exports = Router()
  .get('/:id/owners', async (req, res, next) => {
    try {
      const ownersList = await Pet.getAllOwners(req.params.id, req.user.id);
      res.json(ownersList);
    } catch (e) {
      next(e);
    }
  })
  .get('/:id', authorizeOwner, async (req, res, next) => {
    try {
      const pet = await Pet.getPetById(req.params.id);
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
  })
  .post('/:id/owners', authorizeOwner, async (req, res, next) => {
    try {
      const newOwner = await User.getByEmail(req.body.email);
      const newRelation = await Pet.addOwner(req.params.id, newOwner.id);
      res.json({
        email: req.body.email,
        id: newRelation.user_id,
      });
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
  .delete('/:id/owners', async (req, res, next) => {
    try {
      if (req.body.id === req.user.id) {
        throw new Error('Action not allowed');
      }
      const deleteResp = await Pet.deleteOwnerRel(
        req.params.id,
        req.body.user_id
      );
      if (!deleteResp) {
        throw new Error('Relation not found');
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });
