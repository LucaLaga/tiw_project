import db from '../db/connection.js';

const listAllStmt = db.prepare(`
  SELECT
    l.id, l.user_id, l.book_id, l.borrowed_at, l.returned_at,
    json_object('id', u.id, 'name', u.name, 'email', u.email) AS user,
    json_object('id', b.id, 'title', b.title, 'isbn', b.isbn) AS book
  FROM loans l
  JOIN users u ON l.user_id = u.id
  JOIN books b ON l.book_id = b.id
  WHERE (@user_id IS NULL OR l.user_id = @user_id)
  ORDER BY l.borrowed_at DESC
`);

function listAll(userId = null) {
  const rows = listAllStmt.all({ user_id: userId });

  return rows.map(row => ({
    ...row,
    user: JSON.parse(row.user),
    book: JSON.parse(row.book)
  }));
}


const findByIdStmt = db.prepare(`
  SELECT
    l.id, l.user_id, l.book_id, l.borrowed_at, l.returned_at,
    json_object('id', u.id, 'name', u.name, 'email', u.email) AS user,
    json_object('id', b.id, 'title', b.title, 'isbn', b.isbn) AS book
  FROM loans l
  JOIN users u ON l.user_id = u.id
  JOIN books b ON l.book_id = b.id
  WHERE l.id = ?
`);

function findById(id) {
  const row = findByIdStmt.get(id);
  if (!row) return undefined;

  return {
    ...row,
    user: JSON.parse(row.user),
    book: JSON.parse(row.book)
  };
}


const insertStmt = db.prepare(`
  INSERT INTO loans (user_id, book_id)
  VALUES (@user_id, @book_id)
`);

function create({ user_id, book_id }) {
  const info = insertStmt.run({ user_id, book_id });

  return info.lastInsertRowid;
}


const updateStmt = db.prepare(`
  UPDATE loans
  SET returned_at = @returned_at
  WHERE id = @id
`);

function update({ id, returned_at }) {
  const info = updateStmt.run({ id, returned_at });

  return info.changes > 0;
}


const deleteStmt = db.prepare(`
  DELETE FROM loans WHERE id = ?
`);

function remove(id) {
  const info = deleteStmt.run(id);

  return info.changes > 0;
}


export default { listAll, findById, create, update, remove };
