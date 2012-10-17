var fwk = require('fwk');
var util = require('util');
var path = require('path');

/**
 * Simulate Command Object
 *
 * @param { log }
 */
var simulate = function(spec, my) {
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
    if(args.length < 3)
      return new cb_(new Error('[<size>] or [<path>] missing'));

    var size = parseInt(args[0], 10);
    if(size <= 0 || size >= 100)
      return new cb_(new Error('Invalid size (0 < [<size>] < 100): ' + size));
    my.log.info('Phl0cks size: ' + size);

    args = args.splice(1);

    var phl0cks = [];
    var id = 0;
    args.forEach(function(p) {
      p = path.resolve(p);
      var user = 'simu' + (id++);
      my.log.info('Generating phl0ck [' + user + '] from path: ' + p.magenta);
      phl0cks.push(require('../combat/phl0ck.js').phl0ck({ user: user, path: p }));
    });

    var combat = require('../combat/combat.js').combat({ size: size,
                                                         phl0cks: phl0cks });

    var step_ = function(step, world) {
      //my.log.info('Step: ' + step);
      world.all().forEach(function(p) {
        console.log(util.inspect(p.state()));
        console.log('[' + step + '] ' + p.desc().id + ' ' + p.state().p.x + ' ' + p.state().p.y);
      });
    };

    var control_ = function(step, control) {
      //console.log('control: ' + util.inspect(control));
      for(var id in control) {
        my.log.info(step + ' ' + id + ' ' + control[id].theta + ' ' + control[id].sigma);
      }
    };

    var end_ = function(step, world) {
      my.log.info('Simulation fnished at step: ' + step);
      cb_();
    };

    combat.run(step_, control_, end_);
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Simulate Command:'.underline.magenta.bold);
    my.log.help('');
    my.log.help('Simulate a combat locally.');
    my.log.help('');
    my.log.help('  The `simulate` command will read 2 or more phl0cks whose `path` is passed as');
    my.log.help('  argument and simulate a combat with `size` ships for each of these phl0cks.');
    my.log.help('');
    my.log.help('phl0cks simulate [<size>] [<path1>] [<path2>] ...');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  size'.bold + '   size of the phl0cks (number of ships per phl0ck)');
    my.log.help('  pathN'.bold + '  path to a fl0ck (at least 2 required)');

    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.simulate = simulate;
