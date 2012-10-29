var fwk = require('fwk');
var util = require('util');

/**
 * Login Command Object
 *
 * @param { log }
 */
var login = function(spec, my) {
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
    var password_r = /^.{4,}$/;

    var username = null;
    var password = null;

    that.ask('> '.bold + 'username: '.grey, username_r, false, function(data) {
      username = data;
      that.ask('> '.bold + 'password: '.grey, password_r, true, function(data) {
        password = data;
        done();
      });
    });

    function done() {
      my.log.info('Logging in ' + username.bold + '...');
      var body = {
        username: username,
        password: password
      };
      that.request('POST', '/login', body, function(err, res) {
        if(err)
          return cb_(err);
        else {
          if(res.ok) {
            that.set_store('auth', res.data.auth);
            my.log.info('Successfully logged in as ' + username.magenta);
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
    my.log.help('Login Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Log into Phl0cks.');
    my.log.help('');
    my.log.help('  The `login` command will prompt the user for a username and a password. After');
    my.log.help('  checking the credentials with the server, it will log in the user and keep him');
    my.log.help('  logged in by storing an authentication token in `~/.phl0cks`');
    my.log.help('');
    my.log.help('phl0cks login');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks login');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.login = login;
