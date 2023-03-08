const { Router } = require('express');
const Task = require('../models/Tasks');

module.exports = Router()
  .get('/:petId', async (req, res, next) => {
    try {
      const data = await Task.getTasksByPet(req.params.petId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const data = await Task.getTasksByUser(req.user.id);
      console.log('reqyyy', req.user);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });
