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
 * @param spec { id, owner, type,
 *               invmass, radius,
 *               position, 
 *               velocity }
 */
var missile = function(spec, my) {
  var my = my || {};
  var _super = {};        

  spec.type = spec.type || config.MISSILE_TYPE;

  my.lifespan = config.MISSILE_LIFESPAN;

  // public
  var integrate;
  var desc; 
  var state;

  
  var that = particle(spec, my);

  /*
   * Integration overriding to include missile lifespan
   */
  integrate = function() {
    _super.integrate();

    if(my.lifespan >= 0 &&
       my.lifespan < my.steps * config.STEP_TIME) {
      that.destroy();
    }
  };

  /**
   * returns the description of the missile
   * @param dt duration
   */
  desc = function(dt) {
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

  fwk.method(that, 'integrate', integrate, _super);

  fwk.method(that, 'desc', desc, _super);
  fwk.method(that, 'state', state, _super);

  fwk.getter(that, 'model', my, 'model');
  fwk.getter(that, 'death', my, 'death');

  return that;
};

exports.missile = missile;
