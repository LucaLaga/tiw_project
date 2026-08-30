import express from 'express';

// Import the authentication middlewares
import auth from '../middleware/auth.js';

// Import the repositories (assuming book repo is needed for borrowing logic)
import loanRepo from '../repos/loan.repo.js';
import bookRepo from '../repos/book.repo.js';

const router = express.Router();

// ==========================================
// User Routes
// ==========================================

// GET /loans/personal - Requires standard user authentication
router.get('/loans/personal', auth.requireAuth, (req, res) => {
  // Use the session userId to fetch only the logged-in user's loans
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

  // Optional: Check if book exists and has quantity > 0
  const book = bookRepo.findById(bookId);
  if (!book || book.quantity <= 0) {
    req.session.flash = { type: 'error', message: 'Libro non disponibile.' };
    return res.redirect(303, '/books');
  }

  // Create the loan
  loanRepo.create({ user_id: userId, book_id: bookId });
  
  // Optional: You would ideally decrease the book quantity here via bookRepo
  
  req.session.flash = { type: 'success', message: 'Libro preso in prestito con successo!' };
  res.redirect(303, '/loans/personal');
});


// ==========================================
// Organizer Routes
// ==========================================

// GET /loans - Requires organizer role
router.get('/loans', auth.requireOrganizer, (req, res) => {
  // Calling listAll without a userId fetches everything
  const loans = loanRepo.listAll();

  res.render('pages/loan/loan-list', {
    title: 'Gestione Prestiti',
    loans
  });
});

// POST /loans/:id/return - Mark a book as returned (Requires organizer)
router.post('/loans/:id/return', auth.requireOrganizer, (req, res) => {
  const loanId = Number.parseInt(req.params.id, 10);
  const returnedAt = new Date().toISOString();

  const success = loanRepo.update({ id: loanId, returned_at: returnedAt });

  if (success) {
    req.session.flash = { type: 'success', message: 'Restituzione registrata.' };
  } else {
    req.session.flash = { type: 'error', message: 'Impossibile registrare la restituzione.' };
  }

  res.redirect(303, '/loans');
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
