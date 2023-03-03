-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS users_pets CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS pets_tasks CASCADE;

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR,
  password_hash VARCHAR NOT NULL
);

CREATE TABLE pets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR NOT NULL,
  breed VARCHAR NOT NULL,
  emergency_contact VARCHAR,
  vet VARCHAR,
  notes VARCHAR
);

CREATE TABLE users_pets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pet_id BIGINT,
  user_id BIGINT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);

CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  description VARCHAR NOT NULL,
  time VARCHAR NOT NULL,
  note VARCHAR,
  is_complete BOOLEAN
);

CREATE TABLE pets_tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pet_id BIGINT,
  task_id BIGINT,
  FOREIGN KEY (pet_id) REFERENCES pets(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
)