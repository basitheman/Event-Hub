module.exports = (req, res, next) => {
  req.flash = (type, message) => {
    req.session.flash = req.session.flash || {};
    req.session.flash[type] = req.session.flash[type] || [];
    req.session.flash[type].push(message);
  };

  const flash = req.session.flash || {};
  res.locals.success = flash.success || [];
  res.locals.error = flash.error || [];
  delete req.session.flash;

  next();
};
