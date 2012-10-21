var fwk = require('fwk');
var util = require('util');
var events = require('events');


/**
 * Parser Object copied from Twitter Node
 * 
 * @extends {}
 */
var Parser = function Parser() {    
    events.EventEmitter.call(this);
      this.buffer = '';
        return this;
};


// The parser emits events!
Parser.prototype = Object.create(events.EventEmitter.prototype);
Parser.END        = '\r\n';
Parser.END_LENGTH = 2;

Parser.prototype.receive = function receive(buffer) {    
  this.buffer += buffer.toString('utf8');
  var index, json;    
  // We have END?
  while ((index = this.buffer.indexOf(Parser.END)) > -1) {      
    json = this.buffer.slice(0, index);
    this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
    if (json.length > 0) {          
      try { 
        json = JSON.parse(json);
        this.emit('object', json);
      } catch (error) { 
        this.emit('error', error, json);
      }
    }
  }
};


/**
 * Base Command Object
 *
 * @param { log }
 */
var command = function(spec, my) {
  my = my || {};
  var _super = {};

  my.log = spec.log;
  my.options = spec.options;
  my.parser = new Parser();

  var that = new events.EventEmitter();

  // public
  var execute; /* execute(args, cb_); */
  var help;    /* help(args, cb_); */

  /**
   * Main execution routine to be overwrited by command 
   * implementations
   * @param args the command args
   * @param cb_(err)
   */
  execute = function(args, cb_) {
    return cb_(new Error('Empty command'));
  };

  /**
   * Help function in charge of displaying the help about
   * the command implemented
   * @param args eventual help arguments
   * @param cb_(err)
   */
  help = function(args, cb_) {
    return cb_(new Error('Empty command help'));
  };

  // public
  fwk.method(that, 'execute', execute, _super);
  fwk.method(that, 'help', help, _super);

  return that;
};

exports.command = command;
