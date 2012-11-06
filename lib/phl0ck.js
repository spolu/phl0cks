var fwk = require('fwk');
var cp = require('child_process');
var events = require('events');
var util = require('util');

/**
 * Phl0ck Interface
 *
 * Phl0ck is a wrapper around the sandboxing mechanism
 * used to secure the execution of a phl0ck code. for
 * this reason the control and init mechanism must be 
 * async here.
 *
 * Additionally the Phl0ck interface will emit a 'error' 
 * event if the underlying sandboxed phl0ck code encounters
 * an error (and get disqualified) or do not respect one of 
 * the following constraints:
 *
 * Constraints:
 * ------------
 *  - Execute the `control` code in less than 100ms per ship
 *
 * @extends events.EventEmitter
 *
 * @param spec { user, path }
 */
var phl0ck = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.path = spec.path;
  my.user = spec.user;

  my.id = 0;
  my.cb_ = {};

  // public
  var init;       // init(spec);
  var control;    // control(step, t, ship, ships, missiles, cb);
  var terminate;  // terminate();

  // private
  var handler;  // handler(message); 


  var that = new events.EventEmitter();

  /**
   * Inits the phl0ck by initiating the sandbox and calling
   * the init function of the underlying phl0ck code.
   * @param size number size of the phl0ck, that is the number of
   *                    ships controlled
   * @param spec object the specifications of the game
   * @param cb_ function (err)
   */
  init = function(size, spec, cb_) {
    my.child = cp.fork(__dirname + '/sandbox.js', [my.path]);
    my.child.on('message', handler);
    my.child.send({
      type: 'init',
      size: size,
      spec: spec
    });
    return cb_();
  };

  /**
   * Main wrapper around a given phl0ck exposing the `control`
   * method that is called to control the ships
   * @param step...
   * @param cb_ function (theta, sigma)
   */
  control = function(step, t, ship, ships, missiles, cb_) {
    var id = ++my.id;
    my.cb_[id] = cb_;
    my.child.send({ 
      type: 'control',
      step: step,
      t: t,
      ship: ship,
      ships: ships,
      missiles: missiles,
      id: id
    });
  };

  /**
   * Child process message handler
   * @param message object message received from child process
   */
  handler = function(m) {
    console.log(util.inspect(m));
    switch(m.type) {
      case 'control': {
        if(my.cb_[m.id]) {
          my.cb_[m.id](m.control);
          delete my.cb_[m.id];
        }
        break;
      }
      case 'error': {
        util.error(m.message);
        that.emit('error', m.error);
        break;
      }
    };
  };

  /**
   * Terminates the sandbox process and remove all outstanding
   * handlers
   */
  terminate = function() {
    if(my.child) {
      my.child.kill();
      delete my.child;
    }
  };

  fwk.getter(that, 'user', my, 'user');

  fwk.method(that, 'init', init, _super);
  fwk.method(that, 'control', control, _super);
  fwk.method(that, 'terminate', terminate, _super);

  return that;
};

exports.phl0ck = phl0ck;
