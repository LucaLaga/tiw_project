import bcrypt from 'bcrypt';
import db from './connection.js';

const PWD = bcrypt.hashSync('password123', 10);

const users = [
  { email: 'admin@library.it', name: 'Alice Admin', role: 'organizer' },
  { email: 'bob@test.it',      name: 'Bob Reader',  role: 'user' },
  { email: 'charlie@test.it',  name: 'Charlie User', role: 'user' },
];

const authors = [
  { name: 'George Orwell' },
  { name: 'J.R.R. Tolkien' },
  { name: 'Frank Herbert' },
  { name: 'Isaac Asimov' },
  { name: 'Philip K. Dick' },
  { name: 'Ursula K. Le Guin' },
  { name: 'Aldous Huxley' },
];

const genres = [
  { name: 'Science Fiction' },
  { name: 'Fantasy' },
  { name: 'Dystopian' },
  { name: 'Mystery' },
  { name: 'Philosophy' },
];

const books = [
  {
    isbn: '978-0451524935',
    title: '1984',
    publication_year: 1949,
    pages: 328,
    quantity: 5,
    description: 'A dystopian social science fiction novel and cautionary tale.',
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
  },
  {
    isbn: '978-0553293357',
    title: 'Foundation',
    publication_year: 1951,
    pages: 255,
    quantity: 4,
    description: 'The first book in the galactic empire saga.',
    authorNames: ['Isaac Asimov'],
    genreNames: ['Science Fiction']
  },
  {
    isbn: '978-0544336652',
    title: 'The Fellowship of the Ring',
    publication_year: 1954,
    pages: 423,
    quantity: 3,
    description: 'The first part of The Lord of the Rings.',
    authorNames: ['J.R.R. Tolkien'],
    genreNames: ['Fantasy']
  },
  {
    isbn: '978-0544336669',
    title: 'The Two Towers',
    publication_year: 1954,
    pages: 352,
    quantity: 3,
    description: 'The second part of The Lord of the Rings.',
    authorNames: ['J.R.R. Tolkien'],
    genreNames: ['Fantasy']
  },
  {
    isbn: '978-0544336676',
    title: 'The Return of the King',
    publication_year: 1955,
    pages: 416,
    quantity: 3,
    description: 'The final part of The Lord of the Rings.',
    authorNames: ['J.R.R. Tolkien'],
    genreNames: ['Fantasy']
  },
  {
    isbn: '978-0345339706',
    title: 'Do Androids Dream of Electric Sheep?',
    publication_year: 1968,
    pages: 210,
    quantity: 2,
    description: 'The novel that inspired Blade Runner.',
    authorNames: ['Philip K. Dick'],
    genreNames: ['Science Fiction', 'Philosophy']
  },
  {
    isbn: '978-0441013593',
    title: 'Ubik',
    publication_year: 1969,
    pages: 224,
    quantity: 1,
    description: 'A mind-bending story about life and death.',
    authorNames: ['Philip K. Dick'],
    genreNames: ['Science Fiction', 'Mystery']
  },
  {
    isbn: '978-0441474528',
    title: 'The Left Hand of Darkness',
    publication_year: 1969,
    pages: 286,
    quantity: 3,
    description: 'An exploration of gender and politics on a frozen world.',
    authorNames: ['Ursula K. Le Guin'],
    genreNames: ['Science Fiction', 'Philosophy']
  },
  {
    isbn: '978-0441474412',
    title: 'The Dispossessed',
    publication_year: 1974,
    pages: 300,
    quantity: 2,
    description: 'A story of an anarchist society on two different worlds.',
    authorNames: ['Ursula K. Le Guin'],
    genreNames: ['Science Fiction', 'Dystopian']
  },
  {
    isbn: '978-0553293371',
    title: 'I, Robot',
    publication_year: 1950,
    pages: 250,
    quantity: 5,
    description: 'A collection of short stories about the laws of robotics.',
    authorNames: ['Isaac Asimov'],
    genreNames: ['Science Fiction']
  },
  {
    isbn: '978-0451526342',
    title: 'Animal Farm',
    publication_year: 1945,
    pages: 112,
    quantity: 6,
    description: 'A fable about power and corruption.',
    authorNames: ['George Orwell'],
    genreNames: ['Dystopian']
  },
  {
    isbn: '978-0452284247',
    title: 'Brave New World',
    publication_year: 1932,
    pages: 268,
    quantity: 4,
    description: 'A futuristic society built on stability and genetic engineering.',
    authorNames: ['Aldous Huxley'],
    genreNames: ['Dystopian', 'Science Fiction']
  },
  {
    isbn: '978-04410135 la',
    title: 'The Man in the High Castle',
    publication_year: 1962,
    pages: 256,
    quantity: 2,
    description: 'An alternate history where the Axis powers won WWII.',
    authorNames: ['Philip K. Dick'],
    genreNames: ['Science Fiction', 'Dystopian']
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
