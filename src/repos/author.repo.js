import db from '../db/connection.js';
import { parseJsonColumns } from './utils.js';

const listAllStmt = db.prepare(`
  SELECT
    a.id, 
    a.name,
    (
      SELECT json_group_array(json_object('id', b.id, 'title', b.title, 'publication_year', b.publication_year))
      FROM authors_books ab 
      JOIN books b ON ab.book_id = b.id 
      WHERE ab.author_id = a.id
    ) AS books
  FROM authors a
  WHERE (@query IS NULL OR a.name LIKE '%' || @query || '%')
  ORDER BY a.name ASC
`);

function listAll(searchQuery = null){
  return parseJsonColumns(listAllStmt.all({ query: searchQuery }), ['books']);
}

const findByIdStmt = db.prepare(`
  SELECT
    a.id, 
    a.name,
    (
      SELECT json_group_array(json_object('id', b.id, 'title', b.title, 'publication_year', b.publication_year))
      FROM authors_books ab 
      JOIN books b ON ab.book_id = b.id 
      WHERE ab.author_id = a.id
    ) AS books
  FROM authors a
  WHERE a.id = ?
`);

function findById(id) {
  const row = findByIdStmt.get(id);
  return row ? parseJsonColumns(row, ['books']) : undefined;
}


const insertStmt = db.prepare(`
  INSERT INTO authors (name)
  VALUES (?)
`);

const findByNameStmt = db.prepare(`
  SELECT id FROM authors WHERE name = ?
`);

function findByName(name) {
  return findByNameStmt.get(name);
}

function create(name) {
  const info = insertStmt.run(name);
  return info.lastInsertRowid;
}

const updateStmt = db.prepare(`
  UPDATE authors
  SET name = @name
  WHERE id = @id
`);

function update(values) {
  return updateStmt.run(values).changes > 0;
}

const deleteStmt = db.prepare(`
  UPDATE authors SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  return deleteStmt.run(id).changes > 0;
}

export default { listAll, findById, findByName, create, update, remove };
