var fwk = require('fwk');
var fs = require('fs');
var util = require('util');
var path = require('path');

var phl0ck = require('../combat/phl0ck.js').phl0ck;

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
    if(args.length < 2)
      return new cb_(new Error('<size> or <phl0ck> missing'));

    var size = parseInt(args[0], 10);
    if(size <= 0 || size >= 20)
      return new cb_(new Error('Invalid size (0 < <size> < 20): ' + size));
    my.log.info('Phl0cks size: ' + size);

    args = args.splice(1);

    var phl0cks = [];
    var id = 0;

    args.forEach(function(p) {
      p = path.resolve(p);
      var user = 'simu' + (id++);
      if(!fs.existsSync(p)) 
        return cb_(new Error('File does not exist: ' + p));
      phl0cks.push(phl0ck({ user: user, path: p }));
    });

    var combat = require('../combat/combat.js').combat({ 
      size: size, 
      phl0cks: phl0cks,
      randomize: my.options.randomize 
    });

    var step_ = function(step, world) {
      if(!my.options.short) {
        var data = {
          type: 'step', 
          step: step,
          objects: [] 
        };
        world.all().forEach(function(p) {
          data.objects.push({ 
            type: p.desc().type,
            owner: p.desc().owner,
            id: p.desc().id,
            p: p.state().p,
            v: p.state().v
          });
        });
        console.log(JSON.stringify(data) + '\r\n');
      }
    };

    var control_ = function(step, control, world) {
      if(!my.options.short) {
        for(var id in control) {
          var data = {
            type: 'control',
            step: step,
            id: id,
            theta: control[id].theta,
            sigma: control[id].sigma
          }
          console.log(JSON.stringify(data) + '\r\n');
        }
      }
    };

    var end_ = function(winner, step, world) {
      var data = {
        type: 'end',
        winner: winner,
        draw: winner ? false : true
      };
      console.log(JSON.stringify(data) + '\r\n');
      cb_();
    };

    if(!my.options.short) {
      var data = {
        type: 'init',
        size: combat.size(),
        spec: combat.spec()
      };
      console.log(JSON.stringify(data) + '\r\n'); 
    }

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
    my.log.help('  The `simulate` command will read 1 or more phl0ck(s) whose path is passed as');
    my.log.help('  argument(s) and simulate a combat with <size> ships for each phl0ck. The simulation');
    my.log.help('  data will be dumped on stdout and can be stored to a file or streamed to the');
    my.log.help('  `play` command to be visualized in a browser.');
    my.log.help('');
    my.log.help('phl0cks simulate <size> <phl0ck1> ... [<phl0ckN>]');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  size'.bold + '     size of the phl0cks (number of ships per phl0ck)');
    my.log.help('  phl0ckN'.bold + '  path to a fl0ck (at least 1 required)');
    my.log.help('');
    my.log.help('Options:'.yellow);
    my.log.help('--short'.bold + '    only output the result of the simulation');
    my.log.help('');
    my.log.help('Examples:'.yellow);
    my.log.help('  phl0cks simulate 2 dummy.js dummy.js');
    my.log.help('  phl0cks simulate 3 dummy.js pendulum.js > match.json');
    my.log.help('  phl0cks simulate 1 alife.js food.js | phl0cks play');
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.simulate = simulate;
