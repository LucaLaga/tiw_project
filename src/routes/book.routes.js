import express from 'express';

import auth from '../middleware/auth.js';

import booksRepo from '../repos/book.repo.js';
import authorsRepo from '../repos/author.repo.js';
import genresRepo from '../repos/genre.repo.js';

const router = express.Router();

function getOrcreateEntity(repo, name, associationFn) {
  const entity = repo.findByName(name);
  const entityId = entity ? entity.id : repo.create(name);
  return associationFn(entityId);
}

router.get('/books/create', auth.requireOrganizer, (req, res) => {
  res.render('pages/book/book-create', { title: 'Aggiungi Libro' });
});

router.post('/books/create', auth.requireOrganizer, (req, res) => {
  const { isbn, title, publication_year, pages, quantity, description, authors, genres } = req.body;

  const book_id = booksRepo.create({ isbn, title, publication_year, pages, quantity, description });

  if (!book_id) {
    req.session.flash = { type: 'error', message: 'Errore nella Creazione del Libro' };
    return res.redirect(303, '/books/create');
  }

  try {
    const authorList = (authors || '').split(',').map(a => a.trim()).filter(Boolean);
    for (const authorName of authorList) {
      getOrcreateEntity(authorsRepo, authorName, (id) => booksRepo.addAuthor({ author_id: id, book_id }));
    }

    const genreList = (genres || '').split(',').map(g => g.trim()).filter(Boolean);
    for (const genreName of genreList) {
      getOrcreateEntity(genresRepo, genreName, (id) => booksRepo.addGenre({ genre_id: id, book_id }));
    }
  } catch (e) {
    req.session.flash = { type: 'error', message: 'Errore durante l\'associazione di autori o generi' };
    return res.redirect(303, '/books/create');
  }

  req.session.flash = { type: 'success', message: 'Libro Creato' };
  res.redirect(303, `/books/${book_id}`);
});


router.get('/books', (req, res) => {
  const searchQuery = req.query.q || null;
  const books = booksRepo.listAll(searchQuery);

  res.render('pages/book/book-list', { title: 'Catalogo', books: books, searchQuery: searchQuery });
});

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
