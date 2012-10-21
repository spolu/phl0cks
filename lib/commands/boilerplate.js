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
    var tmpl = 'dummy';
    if(args.length > 1) {
      return cb_(new Error('Invalid arguments: ' + args.join(' ')));
    }
    if(args.length === 1) {
      tmpl = args[0];
    }
    var p = path.resolve(__dirname + '/../../boilerplate/' + tmpl + '.js');
    if(!fs.existsSync(p)) {
      return cb_(new Error('Invalid boilerplate template: ' + tmpl));
    }
    var data = fs.readFileSync(p, 'utf8');
    console.log(data);
    return cb_();
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
    my.log.help('  The `boilerplate`  command will dump a JavaScript phl0ck template of the');
    my.log.help('  specified <type> that can be used to ease the development of a new phl0ck.');
    my.log.help('  The output of the command can be redirected to a file as shown in the');
    my.log.help('  example below.');
    my.log.help('');
    my.log.help('phl0cks boilerplate [<type>] > <path>');
    my.log.help('');
    my.log.help('Arguments:'.yellow);
    my.log.help('  type'.bold + '   type of the boilerplate template to dump (default: `dummy`)');
    my.log.help('         Available templates are: ' + 'dummy, pendulum, astar'.grey);
    return cb_();
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.boilerplate = boilerplate;
