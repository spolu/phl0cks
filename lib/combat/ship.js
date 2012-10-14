var fwk = require('fwk');

var config = require('./config.js').config;
var particle = require('./particle.js').particle;

/**
 * Ship Object
 *
 * @extends particle
 *
 * @emits shoot
 * 
 * @param spec { id, owner, type,
 *               invmass, invinertia, radius
 *               position, orientation,
 *               velocity, rotation }
 */
var ship = function(spec, my) {
  var my = my || {};
  var _super = {};        
    
  spec.type = spec.type || config.SHIP_TYPE;

  my.thrust = config.DEFAULT_THRUST;
  my.missiles = config.MISSILE_STOCK;
  my.refill_step = 0;

  my.theta = null;
  my.sigma = null;

  // public
  var desc;       /* desc()  */
  var state;      /* state() */

  var thrust;     /* thrust(theta) */
  var shoot;      /* shoot(sigma) */


  var that = particle(spec, my);

  /**
   * Integration override to apply thrust
   */
  integrate = function() {
    if(typeof my.theta === 'number') {
      that.applyBP({
        x: my.thrust * Math.cos(my.theta), 
        y: my.thrist * Math.sin(my.theta)
      }, 
      { x: 0, y: 0 });
    }

    _super.integrate();

    var t = (my.step - my.refill_step) * config.STEP_TIME;
    if(t >= config.MISSILE_REFILL_INTERVAL) {
      if(my.missiles < config.MISSILE_STOCK) {
        my.missiles++;
      }
      my.refill_step = my.step;
    }
  };

  /**
   * emits a shoot event with the necessary desc info to
   * create the new missile
   */
  shoot = function(sigma) {
    if(my.missiles > 0) {
      var d = { 
        owner: my.owner,
        position: { 
          x: my.position.x,
          y: my.position.y 
        },
        velocity: { 
          x: my.velocity.x + Math.cos(sigma) * config.MISSILE_SPEED,
          y: my.velocity.y + Math.sin(sigma) * config.MISSILE_SPEED 
        }
      };
      that.emit('shoot', d);

      if(my.missiles === config.MISSILE_STOCK) {
        my.refill_step = my.step;
      }
      my.missiles--;
    }
  };


  /**
   * applies the forces from inputs
   */
  thrust = function(theta) {
    if(typeof theta === 'number')
      my.theta = theta;
    else
      my.theta = null;
  };
  
  /**
   * returns the description of the ship
   */
  desc = function() {
    var d = _super.desc();
    d.thrust = my.thrust;
    d.model = my.model;
    return d;
  };

  /**
   * returns the state of the ship
   */
  state = function() {
    var s = _super.state();
    s.i = my.inputs;
    return s;
  };
        

  fwk.method(that, 'integrate', integrate, _super);

  fwk.method(that, 'desc', desc, _super);
  fwk.method(that, 'state', state, _super);

  fwk.method(that, 'thrust', thrust);
  fwk.method(that, 'shoot', shoot);

  fwk.getter(that, 'model', my, 'model');

  return that;
};

exports.ship = ship;
