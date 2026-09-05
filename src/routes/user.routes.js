import express from 'express';
import bcrypt from 'bcrypt';
import auth from '../middleware/auth.js';
import userRepo from '../repos/user.repo.js';

const router = express.Router();
const BCRYPT_ROUNDS = 10;

router.get('/profile', auth.requireAuth, (req, res) => {
  const user = userRepo.findById(req.session.userId);
  res.render('pages/user/profile', {
    title: 'Il Mio Profilo',
    user
  });
});

router.post('/profile/update', auth.requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { name, password } = req.body;
  
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  
  if (password?.trim()) {
    if (password.length < 8) {
      req.session.flash = { type: 'error', message: 'La password deve avere almeno 8 caratteri.' };
      return res.redirect(303, '/profile');
    }
    updates.password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  if (Object.keys(updates).length === 0) {
    req.session.flash = { type: 'error', message: 'Nessun dato valido fornito.' };
    return res.redirect(303, '/profile');
  }

  userRepo.update(userId, updates);
  req.session.flash = { type: 'success', message: 'Profilo aggiornato con successo!' };
  res.redirect(303, '/profile');
});

router.post('/users/:id/promote', auth.requireOrganizer, (req, res) => {
  const userId = Number.parseInt(req.params.id, 10);
  const { role } = req.body;
  
  if (!['user', 'organizer'].includes(role)) {
    req.session.flash = { type: 'error', message: 'Ruolo non valido.' };
    return res.redirect(303, '/users');
  }

  userRepo.update(userId, { role });
  req.session.flash = { type: 'success', message: 'Ruolo aggiornato con successo!' };
  res.redirect(303, '/users');
});

export default router;
