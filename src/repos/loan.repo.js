import db from '../db/connection.js';
import { parseJsonColumns } from './utils.js';

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
  LIMIT @limit OFFSET @offset
`);

function listAll(userId = null, limit = 20, offset = 0) {
  return parseJsonColumns(listAllStmt.all({ user_id: userId, limit, offset }), ['user', 'book']);
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
  return row ? parseJsonColumns(row, ['user', 'book']) : undefined;
}



// --- BORROW LOGIC ---
const insertStmt = db.prepare(`
  INSERT INTO loans (user_id, book_id)
  VALUES (@user_id, @book_id)
`);
const decrementBookStmt = db.prepare(`
  UPDATE books SET quantity = quantity - 1 WHERE id = ?
`);

// Using a transaction to ensure both queries succeed or fail together
const createLoanTx = db.transaction(({ user_id, book_id }) => {
  decrementBookStmt.run(book_id);
  const info = insertStmt.run({ user_id, book_id });
  return info.lastInsertRowid;
});

function create({ user_id, book_id }) {
  try {
    const id = createLoanTx({ user_id, book_id });
    return id ? id : null;
  } catch (e) {
    return null;
  }
}


// --- RETURN LOGIC ---
const updateStmt = db.prepare(`
  UPDATE loans
  SET returned_at = @returned_at
  WHERE id = @id AND returned_at IS NULL
`);
const incrementBookStmt = db.prepare(`
  UPDATE books SET quantity = quantity + 1 WHERE id = ?
`);
const getLoanBookIdStmt = db.prepare(`
  SELECT book_id FROM loans WHERE id = ? AND returned_at IS NULL
`);

// Using a transaction to safely update the loan and increment the book
const updateLoanTx = db.transaction(({ id, returned_at }) => {
  // First, verify the loan exists and hasn't been returned yet
  const loan = getLoanBookIdStmt.get(id);
  if (!loan) return false;

  const info = updateStmt.run({ id, returned_at });
  
  if (info.changes > 0) {
    incrementBookStmt.run(loan.book_id);
    return true;
  }
  return false;
});

function update({ id, returned_at }) {
  return updateLoanTx({ id, returned_at });
}


const deleteStmt = db.prepare(`
  DELETE FROM loans WHERE id = ?
`);

function remove(id) {
  const info = deleteStmt.run(id);

  return info.changes > 0;
}

const listOverdueStmt = db.prepare(`
  SELECT
    l.id, l.user_id, l.book_id, l.borrowed_at, l.due_date,
    json_object('id', u.id, 'name', u.name, 'email', u.email) AS user,
    json_object('id', b.id, 'title', b.title, 'isbn', b.isbn) AS book
  FROM loans l
  JOIN users u ON l.user_id = u.id
  JOIN books b ON l.book_id = b.id
  WHERE l.returned_at IS NULL AND l.due_date < datetime('now')
  ORDER BY l.due_date ASC
`);

function listOverdue() {
  return parseJsonColumns(listOverdueStmt.all(), ['user', 'book']);
}

export default { listAll, findById, create, update, remove, listOverdue };
