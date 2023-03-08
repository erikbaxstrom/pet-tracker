const pool = require('../utils/pool.js');

module.exports = class Task {
  id;
  description;
  time;
  note;
  is_complete;
  pet_id;

  constructor(row) {
    this.id = row.id;
    this.description = row.description;
    this.time = row.time;
    this.note = row.note;
    this.is_complete = row.is_complete;
    this.pet_id = row.pet_id;
  }

  static async getTasksByUser(userId) {
    const { rows } = await pool.query(
      `
      SELECT tasks.id, tasks.description, tasks.time, tasks.note, tasks.is_complete, tasks.pet_id, pets.name
      FROM tasks
      LEFT JOIN pets on pets.id = tasks.pet_id
      LEFT JOIN users_pets on users_pets.pet_id = pets.id
      LEFT JOIN users on users.id = users_pets.user_id
      WHERE users.id = $1 
      `,
      [userId]
    );
    return rows.map((row) => new Task(row));
  }

  static async getTasksByPet(petId) {
    const { rows } = await pool.query(
      `
      SELECT tasks.id, tasks.description, tasks.time, tasks.note, tasks.is_complete, tasks.pet_id, pets.name
      FROM tasks
      LEFT JOIN pets on pets.id = tasks.pet_id
      WHERE pet_id = $1
      ORDER BY tasks.time
      `,
      [petId]
    );
    return rows.map((row) => new Task(row));
  }

  static async addTask({ description, time, note, is_complete, pet_id }) {
    const { rows } = await pool.query(
      `
      INSERT INTO tasks (description, time, note, is_complete, pet_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [description, time, note, is_complete, pet_id]
    );
    if (!rows[0]) return null;
    return new Task(rows[0]);
  }
};
