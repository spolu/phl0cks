var fwk = require('fwk');
var util = require('util');
var readline = require('readline');

/**
 * Signup Command Object
 *
 * @param { log }
 */
var signup = function(spec, my) {
  my = my || {};
  var _super = {};

  var that = require('./base.js').command(spec, my);

  // public
  var execute; /* execute(args, cb_); */
  var help;    /* help(args, cb_); */

  /**
   * Main execution routine 
   * @param args the command args
   * @param cb_(err)
   */
  execute = function(args, cb_) {
    var username_r = /^[a-zA-Z0-9\-_\.]{3,32}$/;
    var email_r = /^[a-zA-Z0-9\._\-\+]+@[a-z0-9\._\-]{2,}\.[a-z]{2,4}$/;
    var password_r = /.+/;

    var username = null;
    var password = null;
    var email = null;

    var ask_password = function() {
      that.ask('> '.bold + 'password: '.grey, password_r, true, function(pass) {
        that.ask('> '.bold + 'confirm password: '.grey, /.+/, true, function(conf) {
          if(pass !== conf) {
            my.log.warn('The passwords you entered did not match, please try again');
            ask_password();
          }
          else {
            password = pass;
            done();
          }
        });
      });
    }

    my.log.help('To signup, first you will need to provide a username');
    that.ask('> '.bold + 'username: '.grey, username_r, false, function(data) {
      username = data;
      my.log.help('Next, we will require your email address');
      that.ask('> '.bold + 'email: '.grey, email_r, false, function(data) {
        email = data;
        my.log.help('Finally, we will need a password for this account (sent over SSL, hmac stored)');
        ask_password();
      });
    });

    var done = function() {
      my.log.info('Creating account for ' + username.bold + '...');
      var body = {
        username: username,
        password: password,
        email: email
      };
      that.request('POST', '/signup', body, function(err, res) {
        if(err)
          return cb_(err);
        else {
          if(res.ok) {
            that.set_store('auth', res.data.auth);
            my.log.info('Account creation successful!');
            my.log.help('');
            my.log.help('Please check for an email sent to ' + email.grey + ' for further instructions');
            return cb_();
          }
          else {
            return cb_(new Error(res.error));
          }
        }
      });
    };
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Signup Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Signup for Phl0cks.');
    my.log.help('');
    my.log.help('  The `signup` command will prompt the user for a username, email and password to');
    my.log.help('  create a new account for Phl0cks. A verification code is immediately sent to the');
    my.log.help('  email provided. The account will need to be verified using the `verify` command');
    my.log.help('  before it can become fully usable');
    my.log.help('');
    my.log.help('phl0cks signup');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks signup');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.signup = signup;
