function flashMiddleware(req, res, next) {
  if (req.session && req.session.flash) {
    const flash = req.session.flash;
    res.locals.flash = {
      success: flash.type === 'success' ? flash.message : null,
      error: flash.type === 'error' ? flash.message : null,
      info: flash.type === 'info' ? flash.message : null,
    };
    delete req.session.flash;
  } else {
    res.locals.flash = { success: null, error: null, info: null };
  }
  next();
}

export default flashMiddleware;
