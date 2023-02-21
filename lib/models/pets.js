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
    return new Pet(rows[0]);
  }
};
