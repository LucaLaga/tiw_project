import express from 'express';

import authorsRepo from '../repos/author.repo.js';

const router = express.Router();

router.get('/authors', (req, res) => {
  const searchQuery = req.query.query || null;
  const authors = authorsRepo.listAll(searchQuery);

  res.render('pages/author/author-list', {
    title: 'Autori - Libreria Digitale',
    authors,
    query: searchQuery
  });
});

router.get('/authors/:id', (req, res) => {
  const author = authorsRepo.findById(req.params.id);
 
  if (!author) {
    return res.redirect('/authors');
  }

  res.render('pages/author/author', {
    title: `${author.name} - Autore`,
    author
  });
});

export default router;
