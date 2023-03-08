const { Router } = require('express');
const Task = require('../models/Tasks');

module.exports = Router()
  .get('/pet/:petId', async (req, res, next) => {
    try {
      const data = await Task.getTasksByPet(req.params.petId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  })

  .get('/:id', async (req, res, next) => {
    try {
      const task = await Task.getTaskById(req.params.id);
      if (task === null) {
        res.status(404).send();
      }
      res.json(task);
    } catch (e) {
      next(e);
    }
  })

  .post('/pet/:petId', async (req, res, next) => {
    try {
      const object = {
        description: req.body.description,
        is_complete: req.body.is_complete,
        note: req.body.note,
        pet_id: req.params.petId,
        time: req.body.time,
      };
      const task = await Task.addTask(object);
      res.json(task);
    } catch (e) {
      next(e);
    }
  })

  .put('/:id', async (req, res, next) => {
    try {
      const task = await Task.completeTask(req.params.id, req.body);
      res.json(task);
    } catch (e) {
      next(e);
    }
  })

  .delete('/:id', async (req, res, next) => {
    try {
      await Task.deleteTaskById(req.params.id);
      console.log('params', req.params.id);
      res.json({ message: 'delete successful!' });
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const data = await Task.getTasksByUser(req.user.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });
