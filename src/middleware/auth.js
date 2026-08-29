function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = {
      type: 'error',
      message: 'Devi accedere per accedere a questa pagina.',
    };
    req.session.returnTo = req.originalUrl;
    return res.redirect(303, '/login');
  }
  return next();
}

function requireOrganizer(req, res, next) {
  const user = res.locals.currentUser;
  if (!user) {
    req.session.flash = {
      type: 'error',
      message: 'Devi accedere come organizzatore.',
    };
    req.session.returnTo = req.originalUrl;
    return res.redirect(303, '/login');
  }
  if (user.role !== 'organizer') {
    req.session.flash = {
      type: 'error',
      message: 'Sezione riservata agli organizzatori.',
    };
    return res.redirect(303, '/events');
  }
  return next();
}

export default { requireAuth, requireOrganizer };
