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
 *  - Execute the `control` IPC in less than 1000ms per ship
 *  - Execute the `control` IPC in more than 100ms no more 
 *    than 10 times
 * 
 * No limit on `init` but if it takes too long it will impact
 * the first control phase.
 *
 * The phl0ck can be run locally (mainly for test purpose)
 * with the local option set to `true`
 *
 * @extends events.EventEmitter
 *
 * @param spec { user, path, local }
 */
var phl0ck = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.path = spec.path;
  my.user = spec.user;
  my.over = 0;

  my.id = 0;
  my.cb_ = {};
  my.local = spec.local || false;

  // public
  var init;       // init(spec);
  var control;    // control(step, t, ship, ships, missiles, cb);
  var terminate;  // terminate();

  // private
  var handler;  // handler(message); 
  var error;    // error();


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
    if(my.local) {
      my.code = require(my.path);
      my.code.init(size, spec);
      return cb_();
    }

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
    if(my.local) {
      var r = my.code.control(step, t, ship, ships, missiles);
      return cb_(r.theta, r.sigma);
    }

    if(!my.child) {
      return process.nextTick(cb_);
    }
    var id = ++my.id;
    var now = Date.now();
    my.cb_[id] = cb_;
    /* Debug */ //my.cb_[id].now = now;
    if(my.child) {
      my.child.send({ 
        type: 'control',
        step: step,
        t: t,
        ship: ship,
        ships: ships,
        missiles: missiles,
        id: id
      });
    }
    setTimeout(function() {
      my.over++;
      if(my.over >= 10) {
        if(my.cb_[id]) {
          error('Execution took longer than 100ms (x10)');
        }
      }
      // otherwise we let go
    }, 120);
    setTimeout(function() {
      if(my.cb_[id]) {
        error('Execution took longer than 1000ms: ' + (Date.now() - now));
      }
    }, 1000);
  };

  /**
   * Child process message handler
   * @param message object message received from child process
   */
  handler = function(m) {
    switch(m.type) {
      case 'control': {
        if(my.cb_[m.id]) {
          /* Debug */ //util.debug('TOOK: ' + (Date.now() - my.cb_[m.id].now) + 'ms');
          my.cb_[m.id](m.control.theta, m.control.sigma);
          delete my.cb_[m.id];
        }
        break;
      }
      case 'error': {
        error(m.message);
        break;
      }
    };
  };

  /**
   * Handles an error and tries to cleanup everything
   * @param msg error message
   */
  error = function(msg) {
    if(my.child) {
      my.child.kill();
      delete my.child;
    }
    for(var id in my.cb_) {
      my.cb_[id]();
      delete my.cb_[id];
    }
    that.emit('error', new Error(msg));
  };

  /**
   * Terminates the sandbox process and remove all outstanding
   * handlers
   */
  terminate = function() {
    if(my.local) {
      return;
    }

    if(my.child) {
      my.child.kill();
      delete my.child;
    }
    for(var id in my.cb_) {
      my.cb_[id]();
      delete my.cb_[id];
    }
  };

  fwk.getter(that, 'user', my, 'user');

  fwk.method(that, 'init', init, _super);
  fwk.method(that, 'control', control, _super);
  fwk.method(that, 'terminate', terminate, _super);

  return that;
};

exports.phl0ck = phl0ck;
