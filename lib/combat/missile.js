var fwk = require('fwk');

var config = require('./config.js').config;
var particle = require('./particle.js').particle;

/**
 * Missile Object
 *
 * @extends particle
 *
 * @emits destroy
 * 
 * @param spec { id, owner, type, model,
 *               invmass, radius,
 *               position, 
 *               velocity,
 *               lifespan }
 */
var missile = function(spec, my) {
  var my = my || {};
  var _super = {};        

  spec.type = spec.type || config.MISSILE_TYPE;
  my.model = spec.model || config.DEFAULT_MODEL;
  my.lifespan = spec.lifespan || config.DEFAULT_LIFESPAN;

  // public
  var desc; 
  var state;

  
  var that = particle(spec, my);


  // destruction
  setTimeout(function() {
    that.emit('destroy');
  }, my.lifespan);

  /**
   * returns the description of the missile
   */
  desc = function() {
    var d = _super.desc();
    d.model = my.model;
    d.lifespan = my.lifespan;
    return d;
  };

  /**
   * returns the state of the missile
   */
  state = function() {
    var s = _super.state();
    return s;
  };

  fwk.method(that, 'desc', desc, _super);
  fwk.method(that, 'state', state, _super);

  fwk.getter(that, 'model', my, 'model');
  fwk.getter(that, 'death', my, 'death');

  return that;
};

exports.missile = missile;
