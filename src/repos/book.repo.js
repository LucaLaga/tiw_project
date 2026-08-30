import db from '../db/connection.js';

const listAllStmt = db.prepare(`
  SELECT
    b.id, b.isbn, b.title, b.publication_year, b.pages, b.quantity, b.description,
    (
      SELECT json_group_array(json_object('id', a.id, 'name', a.name))
      FROM authors_books ab JOIN authors a ON ab.author_id = a.id WHERE ab.book_id = b.id
    ) AS authors,
    (
      SELECT json_group_array(json_object('id', g.id, 'name', g.name))
      FROM genres_books gb JOIN genres g ON gb.genre_id = g.id WHERE gb.book_id = b.id
    ) AS genres
  FROM books b
  WHERE b.is_active = 1
    AND (@query IS NULL OR b.title LIKE '%' || @query || '%' OR b.isbn LIKE '%' || @query || '%')
  ORDER BY b.title ASC
`);

function listAll(searchQuery = null) {
  const rows = listAllStmt.all({ query: searchQuery });

  return rows.map(row => ({
    ...row,
    authors: JSON.parse(row.authors),
    genres: JSON.parse(row.genres)
  }));
}


const findByIdStmt = db.prepare(`
  SELECT
    b.id, b.isbn, b.title, b.publication_year, b.pages, b.quantity, b.description,
    (
      SELECT json_group_array(json_object('id', a.id, 'name', a.name))
      FROM authors_books ab JOIN authors a ON ab.author_id = a.id WHERE ab.book_id = b.id
    ) AS authors,
    (
      SELECT json_group_array(json_object('id', g.id, 'name', g.name))
      FROM genres_books gb JOIN genres g ON gb.genre_id = g.id WHERE gb.book_id = b.id
    ) AS genres
  FROM books b
  WHERE b.is_active = 1 AND b.id = ?
  ORDER BY b.title ASC
`);

function findById(id) {
  const row = findByIdStmt.get(id);
  if (!row) return undefined;

  return {
    ...row,
    authors: JSON.parse(row.authors),
    genres: JSON.parse(row.genres)
  };
}


const insertStmt = db.prepare(`
  INSERT INTO books (isbn, title, publication_year, pages, quantity, description)
  VALUES (@isbn, @title, @publication_year, @pages, @quantity, @description)
`);

function create({ isbn, title, publication_year, pages, quantity, description }) {
  const info = insertStmt.run({ isbn, title, publication_year, pages, quantity, description });

  return info.lastInsertedRowId;
}


const updateStmt = db.prepare(`
  UPDATE books
  SET isbn = @isbn,
      title = @title,
      publication_year = @publication_year,
      pages = @pages,
      quantity = @quantity,
      description = @description
  WHERE id = @id
`);

function update({ id, isbn, title, publication_year, pages, quantity, description }) {
  const info = updateStmt.run({ id, isbn, title, publication_year, pages, quantity, description });

  return info.changes > 0;
}


const deleteStmt = db.prepare(`
  UPDATE books SET is_active = 0 WHERE id = ?
`);

function remove(id) {
  const info = deleteStmt.run(id);

  return info.changes > 0;
}


export default { listAll, findById, create, update, remove }
