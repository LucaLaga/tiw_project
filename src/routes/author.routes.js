import express from 'express';

import authorsRepo from '../repos/author.repo.js';

const router = express.Router();

router.get('/authors', (req, res) => {
  const searchQuery = req.query.query || null;
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  const authors = authorsRepo.listAll(searchQuery, limit, offset);

  res.render('pages/author/author-list', {
    title: 'Autori - Libreria Digitale',
    authors,
    query: searchQuery,
    currentPage: page,
    hasNextPage: authors.length === limit
  });
});

router.get('/authors/:id', (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const author = authorsRepo.findById(id);
  
  if (!author) {
    return res.redirect('/authors');
  }

  res.render('pages/author/author', {
    title: `${author.name} - Autore`,
    author
  });
});

export default router;
