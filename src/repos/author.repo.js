import db from '../db/connection.js';

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
  const rows = listAllStmt.all({ query: searchQuery });

  return rows.map(row => ({
    ...row,
    books: JSON.parse(row.books)
  }));
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

  if(!row) return undefined;

  return {
    ...row,
    books: JSON.parse(row.books)
  };
}

const insertStmt = db.prepare(`
  INSERT INTO authors (name)
  VALUES (?)
`);

function create(name) {
  return insertStmt.run(name).lastInsertRowid;
}

const updateStmt = db.prepare(`
  UPDATE authors
  SET name = @name
  WHERE id = @id
`);

function update(values) {
  return updateStmt.run(values).changes;
}

const deleteStmt = db.prepare(`
  UPDATE authors SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  return deleteStmt.run(id).changes;
}

export default { listAll, findById, create, update, remove };
