var fwk = require('fwk');
var util = require('util');

/**
 * Challenge Command Object
 *
 * @param { log }
 */
var challenge = function(spec, my) {
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
    return cb_();
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Challenge Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Manage Challenges.');
    my.log.help('');
    my.log.help('  The `challenge` command let the user create, retrieve and combat for challenges. A challenge is');
    my.log.help('  sent by one user to another with a phl0ck size and a phl0ck. The user who receives the challenge');
    my.log.help('  can combat that challenge with any one of his phl0cks until he beats the original phl0ck submitted');
    my.log.help('  with the challenge. Until the challenge is accepted by the challenger, the challenge is displayed');
    my.log.help('  as `pending`.');
    my.log.help('  A user can challenge multiple users at the same time. In that case, the first combat will wait for');
    my.log.help('  all users to accept the challenge and submit a phl0ck for combat. The current winner of a challenge');
    my.log.help('  cannot submit a new phl0ck until it gets beaten by one of the challengers.');
    my.log.help('  Challenges keep track of the number of `attempts` and `wins` by each of the users involve');
    my.log.help('');
    my.log.help('phl0cks challenge new <size> <phl0ck> <user|email> ... [<user|email>]');
    my.log.help('phl0cks challenge list [<id>]');
    my.log.help('phl0cks challenge accept <id> <code> list');
    my.log.help('phl0cks challenge combat <id> <phl0ck>');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  size'.bold + '     size of the phl0cks (number of ships per phl0ck)');


    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.challenge = challenge;
