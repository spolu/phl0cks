var fwk = require('fwk');
var util = require('util');

/**
 * Verify Command Object
 *
 * @param { log }
 */
var verify = function(spec, my) {
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
    if(args.length < 1)
      return new cb_(new Error('<code> missing'));

    var code = args[0];
    that.request('GET', '/verify?code=' + code, null, function(err, res) {
      if(err)
        return cb_(err);
      else {
        if(res.ok) {
          my.log.info('Successfully verified email for ' + username.magenta);
          return cb_();
        }
        else {
          return cb_(new Error(res.error));
        }
      }
    });
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Verify Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Verify user email.');
    my.log.help('');
    my.log.help('  The `verify` command will allow the verification of the user email to finish');
    my.log.help('  the account creation process. The verify code is received by email and is');
    my.log.help('  checked by the server. The `verify` command must be run by a logged in account');
    my.log.help('  such as an account that just finished the signup process.');
    my.log.help('');
    my.log.help('phl0cks verify <code>');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks verify 9f1ef8');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.verify = verify;
