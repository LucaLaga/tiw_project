import express from 'express';
import bcrypt from 'bcrypt';

import userRepo from '../repos/user.repo.js';

const router = express.Router();
const BCRYPT_ROUNDS = 10;

router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Crea un account',
    form: { email: '', name: '' },
    errors: null
  });
});

router.post('/register', async (req, res, next) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const name = String(req.body.name || '').trim();
  const password = String(req.body.password || '');

  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!email || !emailRegex.test(email)) errors.push('Email non valida.');
  if (name.length < 2) errors.push('Il nome deve avere almeno 2 caratteri.');
  if (!password || !passwordRegex.test(password)) errors.push('La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.');

  if (errors.length === 0 && userRepo.findByEmail(email)) {
    errors.push('Esiste già un account con questa email.');
  }

  if (errors.length > 0) {
    return res.status(400).render('auth/register', {
      title: 'Crea un account',
      form: { email, name },
      errors,
    });
  }

  try {
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = userRepo.create({ email, password_hash, name });
    req.session.userId = userId;
    res.redirect(303, '/books');
  } catch (e) {
    next(e);
  }
});


router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Accedi',
    form: { email: '' },
    error: null
  });
});

router.post('/login', async (req, res, next) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const user = email ? userRepo.findByEmail(email) : null;
  let ok = false;
  try {
    ok = user && (await bcrypt.compare(password, user.password_hash));
  } catch (e) {
    return next(e);
  }

  if(!ok) {
    return res.status(401).render('auth/login', {
      title: 'Accedi',
      form: { email },
      error: 'Credenziali non valide.'
    });
  }

  req.session.userId = user.id;
  res.redirect(303, '/books');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect(303, '/');
  });
});

export default router;
