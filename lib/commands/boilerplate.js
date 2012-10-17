var fwk = require('fwk');
var util = require('util');
var path = require('path');
var fs = require('fs');

/**
 * Boilerplate Command Object
 *
 * @param { log }
 */
var boilerplate = function(spec, my) {
  my = my || {};
  var _super = {};

  my.data = fs.readFileSync(__dirname + '/../../boilerplate/phl0ck.js');

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
      return cb_(new Error('[<path>] argument missing'));
    var p = path.resolve(args[0]);
    my.log.info('Creating boilerplate at: ' + p.magenta);
    if(fs.existsSync(p)) {
      return cb_(new Error('File already exists: ' + p));
    }
    else {
      fs.writeFile(p, my.data, function(err) {
        if(err) return cb_(err);
        my.log.info('Boilerplate file written!');
        return cb_();
      });
    }
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Boilerplate Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Creates a pre-built phl0ck template.');
    my.log.help('');
    my.log.help('  This command will create a new file containing a JavaScript phl0ck template');
    my.log.help('  to ease the development of a new phl0ck. If the file pointed by [<path>]');
    my.log.help('  already exists, the operation is aborted.');
    my.log.help('');
    my.log.help('phl0cks boilerplate [<path>]');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  path'.bold + '   path where to create the boilerplate (js extension)');

    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.boilerplate = boilerplate;
