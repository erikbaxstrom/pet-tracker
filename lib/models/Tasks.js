const pool = require('../utils/pool.js');

module.exports = class Task {
  id;
  description;
  time;
  note;
  is_complete;

  constructor(row) {
    this.id = row.id;
    this.description = row.description;
    this.time = row.time;
    this.note = row.note;
    this.is_complete = row.is_complete;
  }

  static async addTask({ description, time, note, is_complete }) {
    const { rows } = await pool.query(
      `
      INSERT INTO tasks (description, time, note, is_complete)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [description, time, note, is_complete]
    );
    if (!rows[0]) return null;
    return new Task(rows[0]);
  }
};
