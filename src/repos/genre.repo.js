import db from '../db/connection.js';
import { parseJsonColumns } from './utils.js';

const listAllStmt = db.prepare(`
  SELECT
    g.id, 
    g.name,
    (
      SELECT json_group_array(json_object('id', b.id, 'isbn', b.isbn, 'title', b.title))
      FROM genres_books gb 
      JOIN books b ON gb.book_id = b.id 
      WHERE gb.genre_id = g.id
    ) AS books
  FROM genres g
  WHERE (@query IS NULL OR g.name LIKE '%' || @query || '%')
  ORDER BY g.name ASC
  LIMIT @limit OFFSET @offset
`);

function listAll(searchQuery = null, limit = 10, offset = 0){
  return parseJsonColumns(listAllStmt.all({ query: searchQuery, limit, offset }), ['books']);
}

const findByIdStmt = db.prepare(`
  SELECT
    g.id, 
    g.name,
    (
      SELECT json_group_array(json_object('id', b.id, 'isbn', b.isbn, 'title', b.title))
      FROM genres_books gb 
      JOIN books b ON gb.book_id = b.id 
      WHERE gb.genre_id = g.id
    ) AS books
  FROM genres g
  WHERE g.id = ?
`);

function findById(id) {
  const row = findByIdStmt.get(id);
  return row ? parseJsonColumns(row, ['books']) : undefined;
}


const insertStmt = db.prepare(`
  INSERT INTO genres (name)
  VALUES (?)
`);

const findByNameStmt = db.prepare(`
  SELECT id FROM genres WHERE name = ?
`);

function findByName(name) {
  return findByNameStmt.get(name);
}

function create(name) {
  const info = insertStmt.run(name);
  return info.lastInsertRowid;
}

const updateStmt = db.prepare(`
  UPDATE genres
  SET name = @name
  WHERE id = @id
`);

function update(values) {
  return updateStmt.run(values).changes > 0;
}

const deleteStmt = db.prepare(`
  UPDATE genres SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

export default { listAll, findById, findByName, create, update, remove };
