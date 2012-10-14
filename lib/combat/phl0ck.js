var fwk = require('fwk');

/**
 * Phl0ck Interface
 *
 * @extends {}
 *
 * @param spec { path }
 */
var phl0ck = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.path = spec.path;

  // public
  var init;     // init(cb_);
  var control;  // control(step, t, config, ship, ships, missiles);


  var that = {};

  /**
   * Inits the fl0ck by retrieving the file and calling the init
   * function on it
   * @param size the size of the phl0ck, that is the number of
   *             ships controlled
   */
  init = function(size) {
    my.fl0ck = require(my.path);
    my.fl0ck.init(size);
  }

  /**
   * Main wrapper around a given phl0ck exposing the `control`
   * method that is called to control the ships
   * @return { theta, sigma }
   */
  control = function(step, t, config, ship, ships, missiles) {
    return my.fl0ck.control(step, t, config, ship, ships, missiles);
  }

  fwk.method(that, 'init', init, _super);
  fwk.method(that, 'control', control, _super);

  return that;
};

exports.phl0ck = phl0ck;
