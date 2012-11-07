var util = require('util');
var path = require('path');
var crypto = require('crypto');
var fwk = require('fwk');
var fs = require('fs');


/**
 * @path GET /play/:combat
 */
exports.get_play = function(req, res, next) {
  var id = req.param('combat');
  var p = path.resolve(req.store.cfg['PHL0CKS_DATA_PATH'] + '/combat/' + id);
  fs.exists(p, function(exists) {
    if(!exists) {
      return res.redirect('/404');
    }
    else {
      res.render('play');
    }
  });
};
