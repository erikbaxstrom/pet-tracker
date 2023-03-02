const pool = require('../utils/pool.js');

module.exports = class Pet {
  id;
  name;
  breed;
  emergency_contact;
  vet;
  notes;

  constructor(row) {
    this.id = row.id;
    this.name = row.name;
    this.breed = row.breed;
    this.emergency_contact = row.emergency_contact;
    this.vet = row.vet;
    this.notes = row.notes;
  }

  static async getAllPets(user_id) {
    const { rows } = await pool.query(
      `
      SELECT pets.id, pet.breed, pets.name, pets.emergency_contact, pets.vet, pets.notes 
      FROM pets
      LEFT JOIN users_pets on users_pets.pet_id = pets.id
      WHERE user_id = $1
      ORDER BY pets.name
      `,
      [user_id]
    );

    return rows.map((row) => new Pet(row));
  }

  static async getPetById(pet_id) {
    const { rows } = await pool.query(
      `
      SELECT pets.id, pet.breed, pets.name, pets.emergency_contact, pets.vet, pets.notes
      FROM pets
      LEFT JOIN users_pets on users_pets.pet_id = pets.id
      WHERE pets.id = $1
      `,
      [pet_id]
    );

    if (!rows[0]) return null;
    return new Pet(rows[0]);
  }

  static async addPetRel(user_id, pet_id) {
    const { rows } = await pool.query(
      `
      INSERT INTO users_pets (pet_id, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [pet_id, user_id]
    );
    if (!rows[0]) return null;
    return new Pet(rows[0]);
  }

  static async addNewPet({ name, breed, emergency_contact, vet, notes }) {
    const { rows } = await pool.query(
      `
      INSERT INTO pets (name, breed, emergency_contact, vet, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, breed, emergency_contact, vet, notes]
    );
    if (!rows[0]) return null;
    return new Pet(rows[0]);
  }

  static async updatePet(pet_id, newAttrs) {
    const pet = await Pet.getPetById(pet_id);
    if (!pet) return null;
    const { name, breed, emergency_contact, vet, notes } = {
      ...pet,
      ...newAttrs,
    };
    const { rows } = await pool.query(
      `
      UPDATE pets
      SET name = $2, breed = $3, emergency_contact = $4, vet = $5, notes = $6
      WHERE id = $1
      RETURNING *
      `,
      [pet_id, name, breed, emergency_contact, vet, notes]
    );
    return new Pet(rows[0]);
  }

  static async addOwner(petId, userId) {
    const { rows } = await pool.query(
      `
      INSERT INTO users_pets (pet_id, user_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [petId, userId]
    );
    if (!rows[0]) return null;
    return rows[0];
  }

  static async checkOwnerRel(petId, userId) {
    const { rows } = await pool.query(
      `
       SELECT * from users_pets
       WHERE pet_id = $1 AND user_id = $2
      `,
      [petId, userId]
    );
    if (!rows[0]) return null;
    return rows[0];
  }

  static async getAllOwners(petId, userId) {
    const { rows } = await pool.query(
      `
      SELECT users_pets.user_id, users.email FROM users_pets
      LEFT JOIN users ON users_pets.user_id = users.id
      WHERE users_pets.pet_id = $1 
      AND users_pets.user_id != $2
      ORDER BY users.email;
     `,
      [petId, userId]
    );
    if (!rows) return null;
    return rows;
  }

  static async deleteOwnerRel(petId, userId) {
    const { rows } = await pool.query(
      `
      DELETE FROM users_pets 
       WHERE pet_id = $1 AND user_id = $2
       RETURNING *;
       `,
      [petId, userId]
    );
    if (!rows[0]) return null;
    return rows;
  }
};
