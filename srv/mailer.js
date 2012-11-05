var crypto = require('crypto');
var fwk = require('fwk');

/** 
 * Mailer Object
 *
 * This object is in charge of scheduling, organizing and triggering
 * emailing when it makes sense
 *
 * @inherits {}
 *
 * @param { cfg, mongo }
 */
var mailer = function(spec, my) {
  my = my || {}; 
  var _super = {}; 

  my.cfg = spec.cfg; 
  my.mongo = spec.mongo;

  my.queue = [];

  // public
  var push;           /* push(username, type, args); */
  var push_to_email;  /* push_to_email(email, type, args); */

  // private

  var that = {};


  /**
   * The push function immediately construct and ends an email of type `type`
   * to user with username `username`. The type decides of which object to use 
   * to generate the email. All email objects derive from a parent mail class.
   * @param username string the username to send to
   * @param type string the mail type
   * @param args object free form arguments
   */
  push = function(username, type, args) {
    function handle(err) {
      console.log('{MAILER} ERROR SENDING MAIL: ' + type + ' [' + username + ']')
      console.log(err);
    };

    var mail = require(__dirname + '/mail_' + type + '.js').mail({ username: username,
                                                                   args: args,
                                                                   cfg: my.cfg,
                                                                   mongo: my.mongo });
    try {
      mail.send(function(err) {
        if(err) {
          handle(err);
        }
      });
    }
    catch(err) {
      handle(err);
    }
  };

  /**
   * The push_to_email function works as the `push` function but sends an email
   * to a specific address instead of an user.
   * @param email string destination email address
   * @param type string the mail type
   * @param args object free form arguments
   */
  push_to_email = function(email, type, args) {
    function handle(err) {
      console.log('{MAILER} ERROR SENDING MAIL: ' + type + ' [' + email + ']')
      console.log(err);
    };

    var mail = require(__dirname + '/mail_' + type + '.js').mail({ email: email,
                                                                   args: args,
                                                                   cfg: my.cfg,
                                                                   mongo: my.mongo });
    try {
      mail.send(function(err) {
        if(err) {
          handle(err);
        }
      });
    }
    catch(err) {
      handle(err);
    }
  };


  fwk.method(that, 'push', push, _super);
  fwk.method(that, 'push_to_email', push_to_email, _super);

  return that;
};

exports.mailer = mailer;
