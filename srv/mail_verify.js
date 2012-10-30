var crypto = require('crypto');
var fwk = require('fwk');
var fs = require('fs');
var handlebars = require('handlebars');

/** 
 * Verify Mail Object
 *
 * Mail specialization for post-signup verification
 *
 * @inherits {}
 *
 * @param { username, args, cfg, mongo }
 */
var mail = function(spec, my) {
  my = my || {}; 
  var _super = {}; 

  // protected
  var construct_html;  /* construct() */
  var construct_txt;   /* construct() */

  var that = require('./mail_base.js').mail(spec, my);

  my.subject = 'Welcome to Phl0cks!';

  /**
   * HTML Construction function to be called recursively
   * @param body the body to construct around
   *                 (allows for recursive construction)
   * @param cb(err, html) callback
   */
  construct_html = function(body, cb) {
    fs.readFile(__dirname + '/mail/verify.html', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var html = tmpl({ 
        username: my.user.username,
        code: my.args.code
      });
      _super.construct_html(html, cb);
    });
  };

  /**
   * TXT Construction function to be called recursively
   * @param body the body to construct around
   *                 (allows for recursive construction)
   * @param cb(err, txt) callback
   */
  construct_txt = function(body, cb) {
    fs.readFile(__dirname + '/mail/verify.txt', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var txt = tmpl({ 
        username: my.user.username,
        code: my.args.code
      });
      _super.construct_txt(txt, cb);
    });
  };

  // protected
  fwk.method(that, 'construct_txt', construct_txt, _super);
  fwk.method(that, 'construct_html', construct_html, _super);

  return that;
};

exports.mail = mail;
