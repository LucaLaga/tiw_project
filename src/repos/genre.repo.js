import db from '../db/connection.js';

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

  if(!row) return undefined;

  return {
    ...row,
    books: JSON.parse(row.books)
  };
}

const insertStmt = db.prepare(`
  INSERT INTO genres (name)
  VALUES (?)
`);

function create(name) {
  return insertStmt.run(name).lastInsertRowid;
}

const updateStmt = db.prepare(`
  UPDATE genres
  SET name = @name
  WHERE id = @id
`);

function update(values) {
  return updateStmt.run(values).changes;
}

const deleteStmt = db.prepare(`
  UPDATE genres SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  return deleteStmt.run(id).changes;
}

export default { listAll, findById, create, update, remove };
