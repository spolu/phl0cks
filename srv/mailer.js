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
  var push;         /* push(username, type, args); */

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
    var mail = require(__dirname + '/mail_' + type + '.js').mail({ username: username,
                                                                   args: args,
                                                                   cfg: my.cfg,
                                                                   mongo: my.mongo });
    try {
      mail.send(function(err) {
        if(err) {
          console.log('{MAILER} ERROR SENDING MAIL: ' + type + ' [' + username + ']')
          console.log(err);
        }
      });
    }
    catch(err) {
      console.log('{MAILER} ERROR SENDING MAIL: ' + type + ' [' + username + ']')
      console.log(err);
    }
  };

  fwk.method(that, 'push', push, _super);

  return that;
};

exports.mailer = mailer;
