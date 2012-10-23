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

Parser.prototype.dump = function() {
  return this.buffer;
};


/**
 * Global counter to generate process wise uid in order to
 * associate a player with each client getting access to
 * a simulation. It is used as socket io channel
 */
var inc = 0;


/**
 * Player Object
 *
 * Given a Readable Stream streaming the dump
 * of a simulation, the player will sequence 
 * steps and emit data in "real" time as well
 * as make available the configuration related
 * to the simulation
 *
 * @inherits {}
 *
 * @param spec { rs }
 */
var player = function(spec, my) {
  my = my || {};
  var _super = {};

  my.rs = spec.rs;
  my.uid = fwk.b64encode(++inc);
  my.parser = new Parser();
  my.inited = false;
  my.buffer = [];

  // public
  var run;    /* run(cb_); */
  var x;      /* x(multi); */

  var that = new events.EventEmitter();

  /**
   * runs the simulation play in realtime emitting 'step'
   * events and calling the callback in case of error or
   * when the simulation is finished
   * @param cb_(err)
   */
  run = function(cb_) {
    var error = function(err) {
      if(my.itv)
        clearInterval(my.itv);
      my.rs.destroy();
      return cb_(err);
    };

    my.rs.setEncoding('utf8');

    my.parser.on('object', function(obj) {
      //console.log(util.inspect(obj));
      if(!my.inited && obj.type !== 'init') {
        error(new Error('Invalid simulation data: init missing'));
      }

      if(obj.type === 'init') {
        my.size = obj.size;
        my.spec = obj.spec;
        my.inited = true;
        that.emit('init', { size: obj.size, spec: obj.spec });

        my.itv = setInterval(function() {
          if(my.buffer.length > 0) {
            var obj = my.buffer.shift();
            that.emit(obj.type, obj);
          }
          else if(my.done) {
            cb_();
          }
        }, my.spec.STEP_TIME);
      }

      if(obj.type === 'step' || obj.type === 'end') {
        my.buffer.push(obj);
      }
    });

    my.parser.on('error', error);

    my.rs.on('data', function(chunk) {
      my.parser.receive(chunk);
    });

    my.rs.on('end', function() {
      my.done = true;
      // if an error occured in the piped process
      // let's try to dump it here and report
      if(/[^\s]+/.test(my.parser.dump())) {
        console.log(my.parser.dump());
        return cb_(new Error('Parse failed'));
      }
    });
  };

  /**
   * Speeds up the replay multi times
   * @param multi the speed factor
   */
  x = function(multi) {
  };

  fwk.method(that, 'run', run, _super);
  fwk.method(that, 'x', x, _super);

  fwk.getter(that, 'uid', my, 'uid');
  
  fwk.getter(that, 'size', my, 'spec');
  fwk.getter(that, 'spec', my, 'size');

  return that;
}

exports.player = player;
