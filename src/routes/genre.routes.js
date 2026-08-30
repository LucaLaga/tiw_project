import express from 'express';

import genreRepo from '../repos/genre.repo.js';

const router = express.Router();

router.get('/genres', (req, res) => {
  const searchQuery = req.query.query || null;
  const genres = genreRepo.listAll(searchQuery);

  res.render('pages/genre/genres-list', {
    title: 'Generi - Libreria Digitale',
    genres,
    query: searchQuery
  });
});

router.get('/genres/:id', (req, res) => {
  const genre = genreRepo.findById(req.params.id);
  
  if (!genre) {
    return res.redirect('/genres');
  }

  res.render('pages/genre/genre', {
    title: `${genre.name} - Genere`,
    genre // The associated books are already bundled in this object!
  });
});

export default router;
