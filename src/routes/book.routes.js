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

router.get('/books/:id/edit', auth.requireOrganizer, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const book = booksRepo.findById(id);

  if (!book) {
    req.session.flash = { type: 'error', message: 'Libro non trovato.' };
    return res.redirect(303, '/books');
  }

  res.render('pages/book/book-edit', { 
    title: `Modifica: ${book.title}`, 
    book 
  });
});

router.post('/books/:id/edit', auth.requireOrganizer, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { isbn, title, publication_year, pages, quantity, description } = req.body;

  const success = booksRepo.update({
    id,
    isbn: String(isbn || '').trim(),
    title: String(title || '').trim(),
    publication_year: Number.parseInt(publication_year, 10),
    pages: Number.parseInt(pages, 10),
    quantity: Number.parseInt(quantity, 10),
    description: String(description || '').trim()
  });

  if (success) {
    req.session.flash = { type: 'success', message: 'Libro aggiornato con successo!' };
    res.redirect(303, `/books/${id}`);
  } else {
    req.session.flash = { type: 'error', message: 'Errore durante l\'aggiornamento del libro.' };
    res.redirect(303, `/books/${id}/edit`);
  }
});

router.post('/books/:id/delete', auth.requireOrganizer, (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  
  const success = booksRepo.remove(id);

  if (success) {
    req.session.flash = { type: 'success', message: 'Libro eliminato con successo.' };
  } else {
    req.session.flash = { type: 'error', message: 'Impossibile eliminare il libro.' };
  }

  res.redirect(303, '/books');
});

export default router;
