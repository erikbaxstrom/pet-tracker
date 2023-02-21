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
    //this.owners
  }
  //old query
  // SELECT * FROM pets
  // LEFT JOIN users_pets on users_pets.pet_id = pets.id
  // WHERE user_id = $1

  static async getAllPets() {
    const { rows } = await pool.query(
      `
        SELECT * FROM pets
      `
    );

    return rows.map((row) => new Pet(row));
  }

  static async insert({ name, breed, emergency_contact, vet, notes }) {
    const { rows } = await pool.query(
      `
      INSERT INTO pets (name, breed, emergency_contact, vet, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, breed, emergency_contact, vet, notes]
    );
    if (!rows[0]) return null;
    // const response = await pool.query(
    //   `
    //       INSERT INTO users_pets (user_id, pet_id)
    //       VALUES ($1, $2)
    //       RETURNING *
    //     `,
    //   [user_id, rows[0].pet_id]
    // );
    // if (!response[0]) return null;
    return new Pet(rows[0]);
  }
};
