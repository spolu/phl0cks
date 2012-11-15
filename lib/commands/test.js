var fwk = require('fwk');
var fs = require('fs');
var util = require('util');
var path = require('path');

var phl0ck = require('../phl0ck.js').phl0ck;

/**
 * Test Command Object
 *
 * @param { log }
 */
var test = function(spec, my) {
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
    // force activate debugging
    my.options.debug = true;

    if(args.length < 1)
      return cb_(new Error('Arguments missing (<phl0ck>)'));
    // phl0ck
    var p = path.resolve(args[0]);
    args = args.splice(1);
    if(!fs.existsSync(p)) 
      return cb_(new Error('File does not exist: ' + p));
    // size
    var size = 4;
    if(args.length > 1) {
      parseInt(args[0], 10);
      args = args.splice(1);
      if(size <= 0 || size >= 20)
        return cb_(new Error('Invalid size (0 < <size> < 20): ' + size));
    }
    my.log.info('Testing Phl0ck with size: ' + size);

    var loop = function(k, n) {
      var phl0cks = [phl0ck({ user: 'test', path: p, local: true })];
      for(var i = 0; i < (n - k); i ++) {
        phl0cks.push(phl0ck({ 
          user: 'dummy' + i, 
          path: path.resolve(__dirname + '/../../boilerplate/dummy.js'),
          local: true
        }));
      }
      var combat = require('../combat/combat.js').combat({ 
        size: size, 
        phl0cks: phl0cks,
        test: true,
        randomize: my.options.randomize 
      });
      combat.run(function() {}, function() {}, function() {
        if(k > 0) {
          loop(--k, n);
        }
        else {
          cb_();
        }
      });
    };

    loop(3, 3);
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Text Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Run tests on a phl0ck locally.');
    my.log.help('');
    my.log.help('  The `test` command will run basic tests on a phl0ck locally for a given `size`');
    my.log.help('  outside of the sandboxing environment so that stacks from the `phl0ck` code are');
    my.log.help('  directly visible to the user');
    my.log.help('');
    my.log.help('phl0cks test <phl0ck> [<size>]');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  phl0ck'.bold + '   path to a phl0ck (1 required)');
    my.log.help('  size'.bold + '     size of the phl0cks (default: 4)');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks test my_phl0ck.js');
    my.log.help('  phl0cks test my_phl0ck.js 3');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.test = test;
