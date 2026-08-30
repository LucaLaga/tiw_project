import express from 'express';

import auth from '../middleware/auth.js';

import booksRepo from '../repos/book.repo.js';

const router = express.Router();

router.get('/books', (req, res) => {
  const searchQuery = req.query.q || null;
  const books = booksRepo.listAll(searchQuery);

  res.render('pages/book/book-list', { title: 'Catalogo', books: books, searchQuery: searchQuery });
})

router.get('/books/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const book = booksRepo.findById(id);

  res.render('pages/book/book', { title: book.title, book: book })
});

export default router;
