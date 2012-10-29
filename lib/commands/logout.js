var fwk = require('fwk');
var util = require('util');

/**
 * Logout Command Object
 *
 * @param { log }
 */
var logout = function(spec, my) {
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
    if(my.options.all) {
      that.request('GET', '/logout', null, function(err, res) {
        if(err) {
          return cb_(err);
        }
        else {
          if(res.ok) {
            my.log.info('All clients have been logged out');
            that.set_store('auth', '');
            my.log.info('Successfully logged out');
            return cb_();
          }
          else {
            return cb_(new Error(res.error));
          }
        }
      });
    }
    else {
      that.set_store('auth', '');
      my.log.info('Successfully logged out');
      return cb_();
    }
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Logout:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Logout from Phl0cks.');
    my.log.help('');
    my.log.help('  The `logout` command will log you out from Phl0cks and remove all credentials');
    my.log.help('  associated with your account from this computer. The command can also log out');
    my.log.help('  all clients connected to this account by expiring the current authentication');
    my.log.help('  token.');
    my.log.help('');
    my.log.help('phl0cks logout');
    my.log.help('');
    my.log.help('Options:'.yellow);
    my.log.help('--all'.bold + '   log all clients out');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks logout');
    my.log.help('  phl0cks logout --all');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.logout = logout;
