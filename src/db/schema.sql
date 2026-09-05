CREATE TABLE
  IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'organizer')),
    created_at TEXT NOT NULL DEFAULT (datetime ('now')),
    is_active INTEGER DEFAULT 1
  );

CREATE TABLE
  IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );

CREATE TABLE
  IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active INEGER NOT NULL DEFAULT 1
  );

CREATE TABLE
  IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    publication_year INTEGER NOT NULL,
    pages INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT "",
    is_active INTEGER NOT NULL DEFAULT 1
  );

CREATE TABLE
  IF NOT EXISTS authors_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors (id),
    FOREIGN KEY (book_id) REFERENCES books (id)
  );

CREATE TABLE
  IF NOT EXISTS genres_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    FOREIGN KEY (genre_id) REFERENCES genres (id),
    FOREIGN KEY (book_id) REFERENCES books (id)
  );

CREATE TABLE
  IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrowed_at TEXT NOT NULL DEFAULT (datetime ('now')),
    due_date TEXT,
    returned_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (book_id) REFERENCES books (id)
  );
