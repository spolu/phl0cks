var events = require('events');
var fwk = require('fwk');

var config = require('./config.js').config;
var world = require('./world.js').world;
var ship = require('./ship.js').ship;

/**
 * Combat Object
 *
 * @extends {}
 *
 * @param spec { size, { user: phl0ck } }
 */
var combat = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.size = spec.size;
  my.phl0cks = spec.phl0cks || {};
  my.ships = {};

  my.world = world({});
  my.control_step = 0;

  // public
  var run;   // run(step_, control_, end_);

  // private
  var init;

  /**
   * Initialization mainly in charge of creating world objects
   * and mapping their ids with their corresponding phl0cks
   */
  init = function() {
    my.phl0cks.forEach(function(ph) {
      ph.init(size);
      for(var i = 0; i < size; i ++) {
        var id = ph.user() + '-' + i;
        my.ships[id] = ship({ 
          id: id, 
          owner: ph.user(),
          position: {
            x: 0,
            y: 0
          }
        });
        my.world.add(my.ships[id]);
      }
    });
  };


  /**
   * Main run loop function. The run loop will initialize and
   * run the combat simulation until it is finished. At each step and
   * each control phase, the corresponding callback will be called
   * to report the progress of the combat.
   * @param step_(step, world)
   *        callback called at each simulation step
   * @param control_(step, { id: { theta, sigma } }) 
   *        calback called with the result of each control phases
   * @param end_()
   *        callback called at the end of the simulation
   */
  run = function(step_, control_, end_) {
    init();

    var run_control = function() {
      for(id in my.ships) {
        
      }
    };

    while(1) {

    }
  };



  fwk.getter(that, 'run', run, _super);

  return that;
};
