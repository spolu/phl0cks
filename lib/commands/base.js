var fwk = require('fwk');
var util = require('util');

/**
 * Base Command Object
 *
 * @param { log }
 */
var command = function(spec, my) {
  my = my || {};
  var _super = {};

  my.log = spec.log;

  var that = {}; 

  // public
  var execute; /* execute(args, cb_); */
  var help;    /* help(args, cb_); */

  /**
   * Main execution routine to be overwrited by command 
   * implementations
   * @param args the command args
   * @param cb_(err)
   */
  execute = function() {
    return cb_(new Error('Empty command'));
  };

  /**
   * Help function in charge of displaying the help about
   * the command implemented
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function() {
    return cb_(new Error('Empty command help'));
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.command = command;
