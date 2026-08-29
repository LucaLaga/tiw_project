import bcrypt from 'bcrypt';
import db from './connection.js';

const PWD = bcrypt.hashSync('password123', 10);

const users = [
  { email: 'admin@library.it', name: 'Alice Admin', role: 'organizer' },
  { email: 'bob@test.it',      name: 'Bob Reader',  role: 'user' },
];

const authors = [
  { name: 'George Orwell' },
  { name: 'J.R.R. Tolkien' },
  { name: 'Frank Herbert' },
];

const genres = [
  { name: 'Science Fiction' },
  { name: 'Fantasy' },
  { name: 'Dystopian' },
];

const books = [
  {
    isbn: '978-0451524935',
    title: '1984',
    publication_year: 1949,
    pages: 328,
    quantity: 5,
    description: 'A dystopian social science fiction novel and cautionary tale.',
    // Custom arrays to easily map relationships during insertion
    authorNames: ['George Orwell'],
    genreNames: ['Science Fiction', 'Dystopian']
  },
  {
    isbn: '978-0547928227',
    title: 'The Hobbit',
    publication_year: 1937,
    pages: 310,
    quantity: 3,
    description: "A children's fantasy novel.",
    authorNames: ['J.R.R. Tolkien'],
    genreNames: ['Fantasy']
  },
  {
    isbn: '978-0441172719',
    title: 'Dune',
    publication_year: 1965,
    pages: 412,
    quantity: 2,
    description: 'A foundational science fiction novel set on the desert planet Arrakis.',
    authorNames: ['Frank Herbert'],
    genreNames: ['Science Fiction']
  }
];

const reset = db.transaction(() => {
  // Clear tables (child tables first to respect potential foreign keys)
  db.exec('DELETE FROM loans');
  db.exec('DELETE FROM genres_books');
  db.exec('DELETE FROM authors_books');
  db.exec('DELETE FROM books');
  db.exec('DELETE FROM genres');
  db.exec('DELETE FROM authors');
  db.exec('DELETE FROM users');
  
  // Reset auto-increment sequences
  db.exec(`
    DELETE FROM sqlite_sequence 
    WHERE name IN ('loans', 'genres_books', 'authors_books', 'books', 'genres', 'authors', 'users')
  `);
  // 1. Insert Users
  const insertUser = db.prepare(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES (@email, @password_hash, @name, @role)`
  );
  for (const u of users) {
    insertUser.run({ ...u, password_hash: PWD });
  }

  // 2. Insert Authors and store their new IDs
  const insertAuthor = db.prepare('INSERT INTO authors (name) VALUES (@name)');
  const authorIds = {};
  for (const a of authors) {
    const info = insertAuthor.run(a);
    authorIds[a.name] = info.lastInsertRowid;
  }

  // 3. Insert Genres and store their new IDs
  const insertGenre = db.prepare('INSERT INTO genres (name) VALUES (@name)');
  const genreIds = {};
  for (const g of genres) {
    const info = insertGenre.run(g);
    genreIds[g.name] = info.lastInsertRowid;
  }

  // 4. Insert Books and map junction tables
  const insertBook = db.prepare(
    `INSERT INTO books (isbn, title, publication_year, pages, quantity, description)
     VALUES (@isbn, @title, @publication_year, @pages, @quantity, @description)`
  );
  const insertAuthorBook = db.prepare(
    'INSERT INTO authors_books (author_id, book_id) VALUES (@author_id, @book_id)'
  );
  const insertGenreBook = db.prepare(
    'INSERT INTO genres_books (genre_id, book_id) VALUES (@genre_id, @book_id)'
  );

  for (const b of books) {
    const info = insertBook.run({
      isbn: b.isbn,
      title: b.title,
      publication_year: b.publication_year,
      pages: b.pages,
      quantity: b.quantity,
      description: b.description
    });
    
    const bookId = info.lastInsertRowid;

    // Link authors
    for (const authorName of b.authorNames) {
      insertAuthorBook.run({ author_id: authorIds[authorName], book_id: bookId });
    }

    // Link genres
    for (const genreName of b.genreNames) {
      insertGenreBook.run({ genre_id: genreIds[genreName], book_id: bookId });
    }
  }
});

reset();
console.log(`[seed] inseriti ${users.length} utenti e ${books.length} libri.`);
console.log('[seed] credenziali di test (password: password123):');
for (const u of users) console.log(`        - ${u.email} [${u.role}]`);

