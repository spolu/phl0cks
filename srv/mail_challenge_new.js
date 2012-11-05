var crypto = require('crypto');
var fwk = require('fwk');
var fs = require('fs');
var handlebars = require('handlebars');

/** 
 * Challenge New Mail Object
 *
 * Mail specialization for challenge new
 *
 * @inherits {}
 *
 * @param { username, args, cfg, mongo }
 */
var mail = function(spec, my) {
  my = my || {}; 
  var _super = {}; 

  // protected
  var subject;         /* subject(cb); */
  var construct_html;  /* construct_html(body, cb) */
  var construct_txt;   /* construct_html(body, cb) */

  var that = require('./mail_base.js').mail(spec, my);

  /**
   * Subject Construction function
   * @param cb function (err, subj) 
   */
  subject = function(cb) {
    return cb(null, 'You\'ve just been challenged by ' + my.args.from);
  };

  /**
   * HTML Construction function to be called recursively
   * @param body the body to construct around
   *                 (allows for recursive construction)
   * @param cb(err, html) callback
   */
  construct_html = function(body, cb) {
    fs.readFile(__dirname + '/mail/challenge_new.html', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var html = tmpl({ 
        from: my.args.from,
        size: my.args.size,
        count: my.args.count
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
    fs.readFile(__dirname + '/mail/challenge_new.txt', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var txt = tmpl({ 
        from: my.args.from,
        size: my.args.size,
        count: my.args.count
      });
      _super.construct_txt(txt, cb);
    });
  };

  // protected
  fwk.method(that, 'subject', subject, _super);
  fwk.method(that, 'construct_txt', construct_txt, _super);
  fwk.method(that, 'construct_html', construct_html, _super);

  return that;
};

exports.mail = mail;
