/**
 * @path get /
 */
exports.get_index = function(req, res, next) {
  res.render('landing');
};

/**
 * @path get /404
 */
exports.get_404 = function(req, res, next) {
  res.json({ ok: false,
             code: 404 }, 404);
};
