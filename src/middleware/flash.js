function flashMiddleware(req, res, next) {
  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  next();
}

export default flashMiddleware;
