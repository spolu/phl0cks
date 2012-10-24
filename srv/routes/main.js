/**
 * @path GET /
 */
exports.get_index = function(req, res, next) {
  res.render('landing',
             { landing: true });
};

