const pool = require('../utils/pool.js');

module.exports = class Task {
  id;
  description;
  time;
  note;
  is_complete;
  pet_id;
  pet_name;

  constructor(row) {
    this.id = row.id;
    this.description = row.description;
    this.time = row.time;
    this.note = row.note;
    this.is_complete = row.is_complete;
    this.pet_id = row.pet_id;
    this.pet_name = row.pet_name;
  }

  static async getTaskById(id) {
    const { rows } = await pool.query(
      `
      SELECT * FROM tasks
      WHERE id = $1
      `,
      [id]
    );
    if (!rows[0]) return null;
    return new Task(rows[0]);
  }

  static async getTasksByUser(userId) {
    const { rows } = await pool.query(
      `
      SELECT tasks.id, tasks.description, tasks.time, tasks.note, tasks.is_complete, tasks.pet_id, pets.name AS pet_name
      FROM tasks
      LEFT JOIN pets on pets.id = tasks.pet_id
      LEFT JOIN users_pets on users_pets.pet_id = pets.id
      LEFT JOIN users on users.id = users_pets.user_id
      WHERE users.id = $1 
      ORDER BY tasks.time
      `,
      [userId]
    );
    return rows.map((row) => new Task(row));
  }

  static async getTasksByPet(petId) {
    const { rows } = await pool.query(
      `
      SELECT tasks.id, tasks.description, tasks.time, tasks.note, tasks.is_complete, tasks.pet_id, pets.name as pet_name
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

  static async completeTask(id, newAttrs) {
    const task = await Task.getTaskById(id);
    if (!task) return null;
    const { is_complete } = { ...task, ...newAttrs };
    const { rows } = await pool.query(
      `
      UPDATE tasks
      SET is_complete = $2
      WHERE id = $1
      RETURNING *
      `,
      [id, is_complete]
    );
    return new Task(rows[0]);
  }

  static async deleteTaskById(id) {
    const task = await Task.getTaskById(id);
    if (!task) return null;

    const { rows } = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    return new Task(rows[0]);
  }
};
