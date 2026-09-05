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

  const pubYear = Number.parseInt(publication_year, 10);
  const pgCount = Number.parseInt(pages, 10);
  const qty = Number.parseInt(quantity, 10);

  const errors = [];
  if (!isbn?.trim()) errors.push('ISBN obbligatorio.');
  if (!title?.trim()) errors.push('Titolo obbligatorio.');
  if (isNaN(pubYear) || pubYear < 0 || pubYear > new Date().getFullYear()) errors.push('Anno di pubblicazione non valido.');
  if (isNaN(pgCount) || pgCount <= 0) errors.push('Numero di pagine non valido.');
  if (isNaN(qty) || qty < 0) errors.push('Quantità non valida.');

  if (errors.length > 0) {
    req.session.flash = { type: 'error', message: errors.join(' ') };
    return res.redirect(303, '/books/create');
  }

  const book_id = booksRepo.create({ 
    isbn: isbn.trim(), 
    title: title.trim(), 
    publication_year: pubYear, 
    pages: pgCount, 
    quantity: qty, 
    description: (description || '').trim() 
  });

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
  const authorQuery = req.query.author || null;
  const genreQuery = req.query.genre || null;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const books = booksRepo.listAll(searchQuery, authorQuery, genreQuery, limit, offset);

  const last_page = Math.ceil(books.length / limit);

  res.render('pages/book/book-list', { 
    title: 'Catalogo', 
    books: books.slice(offset, offset+5), 
    searchQuery: searchQuery,
    currentPage: page,
    hasNextPage: (offset+5) < books.length
  });
});

router.get('/books/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const book = booksRepo.findById(id);

  if (!book) {
    req.session.flash = { type: 'error', message: 'Libro non trovato.' };
    return res.redirect(303, '/books');
  }

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

  const pubYear = Number.parseInt(publication_year, 10);
  const pgCount = Number.parseInt(pages, 10);
  const qty = Number.parseInt(quantity, 10);

  const errors = [];
  if (!isbn?.trim()) errors.push('ISBN obbligatorio.');
  if (!title?.trim()) errors.push('Titolo obbligatorio.');
  if (isNaN(pubYear) || pubYear < 0 || pubYear > new Date().getFullYear()) errors.push('Anno di pubblicazione non valido.');
  if (isNaN(pgCount) || pgCount <= 0) errors.push('Numero di pagine non valido.');
  if (isNaN(qty) || qty < 0) errors.push('Quantità non valida.');

  if (errors.length > 0) {
    req.session.flash = { type: 'error', message: errors.join(' ') };
    return res.redirect(303, `/books/${id}/edit`);
  }

  const success = booksRepo.update({
    id,
    isbn: String(isbn || '').trim(),
    title: String(title || '').trim(),
    publication_year: pubYear,
    pages: pgCount,
    quantity: qty,
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
