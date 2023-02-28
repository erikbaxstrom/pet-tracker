const Pet = require('../models/Pets.js');

module.exports = async (req, res, next) => {
  try {
    const rel = await Pet.checkOwnerRel(req.params.id, req.user.id);
    if (rel) {
      next();
    } else {
      throw new Error('ACCESS DENIED');
    }
  } catch (err) {
    err.status = 403;
    next(err);
  }
};

// const pet = await Pet.getPetById(req.params.id);
// if (pet && (Pet.user_id === req.user.id || req.user.email === 'admin')) {
//   next();
