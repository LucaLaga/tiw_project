import express from 'express';

import genreRepo from '../repos/genre.repo.js';

const router = express.Router();

router.get('/genres', (req, res) => {
  const searchQuery = req.query.query || null;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const genres = genreRepo.listAll(searchQuery, limit, offset);

  res.render('pages/genre/genres-list', {
    title: 'Generi - Libreria Digitale',
    genres,
    query: searchQuery,
    currentPage: page,
    hasNextPage: genres.length === limit
  });
});

router.get('/genres/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const genre = genreRepo.findById(id);
  
  if (!genre) {
    return res.redirect('/genres');
  }

  res.render('pages/genre/genre', {
    title: `${genre.name} - Genere`,
    genre // The associated books are already bundled in this object!
  });
});

export default router;
