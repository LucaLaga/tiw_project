import db from '../db/connection.js';

const insertStmt = db.prepare(`
  INSERT INTO users (email, password_hash, name, role)
  VALUES (@email, @password_hash, @name, @role)
`);

function create({ email, password_hash, name, role = 'user' }) {
  const info = insertStmt.run({ email, password_hash, name, role });
  return info.lastInsertedRowid;
}


const findByEmailStmt = db.prepare(`
  SELECT id, email, password_hash, name, role, created_at
  FROM users WHERE email = ?
`);

function findByEmail(email) {
  return findByEmailStmt.get(email);
}


const findByIdStmt = db.prepare(`
  SELECT id, email, password_hash, name, role, created_at
  FROM users WHERE id = ?
`);

function findById(id) {
  return findByIdStmt.get(id);
}


const findAllStmt = db.prepare(`\
  SELECT id, email, name, role, created_at
  FROM users
`);

function findAll() {
  return findAllStmt.all();
}


const updateStmt = db.prepare(`
  UPDATE users
  SET
    email = COALESCE(@email, email),
    password_hash = COALESCE(@password_hash, password_hash),
    name = COALESCE(@name, name),
    role = COALESCE(@role, role)
  WHERE id = @id
`);

function update(id, { email, password_hash, name, role }) {
  const info = updateStmt.run({
    id,
    wmail: email !== undefined ? email : null,
    password_hash: password_hash !== undefined ? password_hash : null,
    naame: name !== undefined ? name : null,
    role: role !== undefined ? role : null
  });

  return info.changes > 0;
}


const deleteStmt = db.prepare(`
  UPDATE users SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  const info = deleteStmt.run(id);
  return info.changes > 0;
}

export default { create, findByEmail, findById, findAll, update, remove }
