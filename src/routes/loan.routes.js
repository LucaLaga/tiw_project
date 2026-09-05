import express from 'express';

// Import the authentication middlewares
import auth from '../middleware/auth.js';

// Import the repositories
import loanRepo from '../repos/loan.repo.js';
import bookRepo from '../repos/book.repo.js';

const router = express.Router();

// ==========================================
// User Routes
// ==========================================

// GET /loans/personal - Requires standard user authentication
router.get('/loans/personal', auth.requireAuth, (req, res) => {
  const userId = req.session.userId;
  const loans = loanRepo.listAll(userId);

  res.render('pages/loan/loan-list', {
    title: 'I Miei Prestiti',
    loans
  });
});

// POST /loans - Borrow a book (Requires auth)
router.post('/books/:id/borrow', auth.requireAuth, (req, res) => {
  const userId = req.session.userId;
  const bookId = Number.parseInt(req.params.id, 10);

  // Check if book exists and has available quantity
  const book = bookRepo.findById(bookId);
  if (!book || book.quantity <= 0) {
    req.session.flash = { type: 'error', message: 'Libro non disponibile.' };
    return res.redirect(303, '/books');
  }

  // Create the loan (quantity decrement is now handled inside loanRepo)
  loanRepo.create({ user_id: userId, book_id: bookId });
  
  req.session.flash = { type: 'success', message: 'Libro preso in prestito con successo!' };
  res.redirect(303, '/loans/personal');
});

// POST /loans/:id/return - Mark a book as returned (Requires authentication)
router.post('/loans/:id/return', auth.requireAuth, (req, res) => {
  const loanId = Number.parseInt(req.params.id, 10);
  const loan = loanRepo.findById(loanId);

  if (!loan) {
    req.session.flash = { type: 'error', message: 'Prestito non trovato.' };
    return res.redirect(303, '/loans/personal');
  }

  const isOwner = loan.user_id === req.session.userId;
  const currentUser = res.locals.currentUser;
  const isOrganizer = currentUser && currentUser.role === 'organizer';

  if (!isOwner && !isOrganizer) {
    req.session.flash = { type: 'error', message: 'Non puoi restituire un prestito che non ti appartiene.' };
    return res.redirect(303, '/loans/personal');
  }

  const returnedAt = new Date().toISOString();


  // update() now handles the quantity increment internally and prevents double-returns
  const success = loanRepo.update({ id: loanId, returned_at: returnedAt });

  if (success) {
    req.session.flash = { type: 'success', message: 'Restituzione registrata con successo.' };
  } else {
    req.session.flash = { type: 'error', message: 'Impossibile registrare la restituzione (potrebbe essere già stata effettuata).' };
  }

  res.redirect(303, '/loans/personal');
});

// ==========================================
// Organizer Routes
// ==========================================

// GET /loans/overdue - Requires organizer role
router.get('/loans/overdue', auth.requireOrganizer, (req, res) => {
  const loans = loanRepo.listOverdue();
  res.render('pages/loan/loan-list', {
    title: 'Prestiti Scaduti',
    loans
  });
});

// GET /loans - Requires organizer role
router.get('/loans', auth.requireOrganizer, (req, res) => {
  const loans = loanRepo.listAll();

  res.render('pages/loan/loan-list', {
    title: 'Gestione Prestiti',
    loans
  });
});

// GET /loans/:id - View loan details (Requires auth)
router.get('/loans/:id', auth.requireAuth, (req, res) => {
  const loanId = Number.parseInt(req.params.id, 10);
  const loan = loanRepo.findById(loanId);

  if (!loan) {
    req.session.flash = { type: 'error', message: 'Prestito non trovato.' };
    return res.redirect(303, '/loans/personal');
  }

  const currentUser = res.locals.currentUser;
  const isOwner = loan.user_id === req.session.userId;
  const isOrganizer = currentUser && currentUser.role === 'organizer';

  // Allow access ONLY if the user is the owner OR an organizer
  if (!isOwner && !isOrganizer) {
    req.session.flash = { type: 'error', message: 'Accesso negato. Sezione riservata agli organizzatori o al titolare del prestito.' };
    return res.redirect(303, '/loans/personal');
  }

  res.render('pages/loan/loan', {
    title: `Dettaglio Prestito #${loan.id}`,
    loan
  });
});

export default router;
