var util = require('util');

var my = {};

/**
 * --------------
 * Initialization
 * --------------
 *
 *  The `init` function is called with the number of ships active per
 *  phl0cks in this game. The `init` function is a good place to
 *  initialize your data structure and prepare everything for the
 *  first call to control. Any global variable defined here will be
 *  preserved and accessible by the control function at each control
 *  phase.
 *
 * @param size number of ships per phl0ck
 * @param spec specifications of the simulated world
 */
exports.init = function(size, spec) {
  my.spec = spec;
  return;
};

/**
 * -------
 * Control
 * -------
 *
 *  The `control` function is called at each control phase. The funciton
 *  is called once for every ship controlled by this fl0ck. The control
 *  function should implement your AI algorithm and return an object with
 *  two fields `theta` and `sigma`.
 *  `theta`  if defined the angle of the thrust to apply over the next
 *           control period (in radians)
 *  `sigma`  if defined the angle to use to shoot a new missile in the
 *           current simulation step if the ship still has missiles
 *
 * @param step     the current simulation step
 * @param t        the time equivalent of the current step in ms 
 * @param ship     the state and description of the ship to control 
 * @param ships    the array of all other ships still alive
 * @param missiles the array of all the missiles still in the wild
 *
 * @return { theta, sigma } control values
 */
exports.control = function(step, t, ship, ships, missiles) {
  var theta = undefined;
  // The pendulum continuously readjust its speed to make sure
  // it does not reach an extremity of the world. It approximate
  // a central force with a very simple implementation
  if(Math.abs(ship.state.p.x) > Math.abs(ship.state.p.y)) {
    if(ship.state.p.x * ship.state.v.x >= -0.01) {
      theta = ship.state.p.x > 0 ? Math.PI : 0;
    }
  }
  else {
    if(ship.state.p.y * ship.state.v.y >= -0.01) {
      theta = ship.state.p.y > 0 ? Math.PI / 2 : 3 * Math.PI / 2;
    }
  }
  return { 
    theta: theta
  };
};
