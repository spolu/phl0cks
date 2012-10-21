var fwk = require('fwk');
var util = require('util');

/**
 * Play Command Object
 *
 * @param { log }
 */
var play = function(spec, my) {
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
    my.parser.on('object', function(json) {
      console.log(json.step);
    });

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (chunk) {
      my.parser.receive(chunk);
    });

    process.stdin.on('end', function () {
        process.stdout.write('end');
    });
    return cb_();
  };

  /**
   * Help function in charge of displaying the help
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    my.log.help('Play Command:'.underline.cyan.bold);
    my.log.help('');

    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.play = play;
