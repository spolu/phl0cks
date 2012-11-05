var crypto = require('crypto');
var fwk = require('fwk');
var nodemailer = require("nodemailer");
var handlebars = require('handlebars');
var fs = require('fs');

/** 
 * Mail Object
 *
 * This is the base mail object with send capabilities as well as the
 * basic layouting
 *
 * @inherits {}
 *
 * @param { username, cfg, mongo }
 */
var mail = function(spec, my) {
  my = my || {}; 
  var _super = {}; 

  my.username = spec.username || null;  // might be undefined
  my.email = spec.email || null;        // might be udnefined 
  my.args = spec.args;
  my.type = spec.type || 'base';

  my.cfg = spec.cfg; 
  my.mongo = spec.mongo;
  my.transport = nodemailer.createTransport("SMTP", {
    host: my.cfg['PHL0CKS_SMTP_HOST'],
    port: my.cfg['PHL0CKS_SMTP_PORT'],
    user: my.cfg['PHL0CKS_SMTP_USER'],
    pass: my.cfg['PHL0CKS_SMTP_PASS']
  });

  // public
  var send;            /* send(cb); */

  // protected
  var subject;         /* subject() */
  var construct_html;  /* construct_html() */
  var construct_txt;   /* construct_txt() */

  // private
  var construct;    /* construct() */

  var that = {};


  /**
   * Subject Construction function
   * @param cb function (err, subj) 
   */
  subject = function(cb) {
    return cb(null, 'no_subject');
  };

  /**
   * HTML Construction function to be called recursively
   * @param body the body to construct around
   *                 (allows for recursive construction)
   * @param cb(err, html) callback
   */
  construct_html = function(body, cb) {
    fs.readFile(__dirname + '/mail/base.html', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var html = tmpl({ 
        body: body,
        subject: that.subject(),
        username: my.username,
        email: my.email
      });
      return cb(null, html);
    });
  };

  /**
   * TXT Construction function to be called recursively
   * @param body the body to construct around
   *                 (allows for recursive construction)
   * @param cb(err, txt) callback
   */
  construct_txt = function(body, cb) {
    fs.readFile(__dirname + '/mail/base.txt', 'utf8', function(err, src) {
      if(err) return cb(err);
      var tmpl = handlebars.compile(src, {});
      var txt = tmpl({ 
        body: body,
        subject: that.subject(),
        username: my.username,
        email: my.email
      });
      return cb(null, txt);
    });
  };

  /**
   * Global constructor, will call recusrively the html and txt
   * constructors and assemble the email
   * @param cb(err, txt, html)
   */
  construct = function(cb) {
    var html = '';
    var txt = '';
    var error = null;

    var c = my.mongo.collection('users');
    c.findOne({username: my.username}, function(err, usr) {
      if(err) return cb(err);
      else {
        my.user = usr;
        if(my.user) {
          my.email = my.email || my.user.email;
        }

        var mplex = fwk.mplex({});

        var html_cb = mplex.callback();
        that.construct_html('', function(err, h) {
          if(err) error = err;
          else html = h;
          return html_cb(); 
        });

        var txt_cb = mplex.callback();
        that.construct_txt('', function(err, t) {
          if(err) error = err;
          else txt = t;
          return html_cb(); 
        });

        mplex.go(function() {
          if(error) return cb(error);
          else {
            cb(null, txt, html);
          }
        });
      }
    });
  };


  /**
   * Public funtion in charge of managing the construction and then
   * the delivery of this email
   * @param cb(err) 
   */
  send = function(cb) {
    that.construct(function(err, txt, html) {
      if(err)
        return cb(err);
      else {
        that.subject(function(err, subj) {
          if(err)
            return cb(err);
          else {

            var opt = {
              from: "Phl0cks <admin@phl0cks.net>",
              to: my.email,
              subject: '[phl0cks] ' + subj,
              text: txt,
              html: html
            }

            // SEND
            my.transport.sendMail(opt, function(err) {
              if(err) return cb(err);
              else {
                // UPDATE EMAILS DATA
                var c = my.mongo.collection('emails');
                var upd = { $inc: {},
                  $set: {} };
                  upd.$inc[my.type + '.cnt'] = 1;
                  upd.$set[my.type + '.lst'] = new Date();
                  c.update({usr: my.g_id}, upd, {multi: false, safe: true}, function(err) {
                    if(err) return cb(err);
                    else {
                      return cb();
                    }
                  });
              }
            });
          }
        });
      }
    });
  }

  // protected
  fwk.method(that, 'subject', subject, _super);
  fwk.method(that, 'construct_txt', construct_txt, _super);
  fwk.method(that, 'construct_html', construct_html, _super);
  fwk.method(that, 'construct', construct, _super);

  // public
  fwk.method(that, 'send', send, _super);
  fwk.getter(that, 'type', my, 'type');
  fwk.getter(that, 'subject', my, 'subject');

  return that;
};


exports.mail = mail;
