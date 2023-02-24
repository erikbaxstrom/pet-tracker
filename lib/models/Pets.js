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
      SELECT * FROM pets
      LEFT JOIN users_pets on users_pets.pet_id = pets.id
      WHERE user_id = $1
      ORDER BY pets.name
      `,
      [user_id]
    );

    return rows.map((row) => new Pet(row));
  }

  // SELECT * from pets
  // LEFT JOIN users_pets on users_pets.pet_id = pets.id
  // WHERE id = $1
  // ORDER BY pets.name

  static async getPetById(pet_id) {
    const { rows } = await pool.query(
      `
        SELECT * from pets
        LEFT JOIN users_pets on users_pets.pet_id = pets.id
        WHERE pet_id = $1
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
};
