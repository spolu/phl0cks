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
 * @param spec { id, owner, type, model,
 *               invmass, invinertia, radius
 *               position, orientation,
 *               velocity, rotation,
 *               thrust, missile }
 */
var ship = function(spec, my) {
  var my = my || {};
  var _super = {};        
    
  spec.type = spec.type || config.SHIP_TYPE;
  my.thrust = spec.thrust || config.DEFAULT_THRUST;
  my.model = spec.model || config.DEFAULT_MODEL;
  my.missile = spec.missile || config.DEFAUL_MISSILE;

  my.last_shoot_steps = 0;  

  // public
  var desc;       /* desc()  */
  var state;      /* state() */

  var thrust;     /* thrust(theta) */
  var shoot;      /* shoot(sigma) */


  var that = particle(spec, my);


  that.on('destroy', function() {
  });

  that.on('shoot', function() {
    my.last_shoot_steps = my.integration_steps;
  });


  /**
   * emits a shoot event with the necessary desc info to
   * create the new missile
   */
  shoot = function(sigma) {
    if(my.steps - my.last_shoot_steps > config.MISSILE_REPETITION[my.missile]) {
      var d = { 
        owner: my.owner,
        model: my.missile,
        position: { 
          x: my.position.x,
          y: my.position.y 
        },
        velocity: { 
          x: my.velocity.x + Math.cos(sigma) * config.MISSILE_SPEED[my.missile],
          y: my.velocity.y + Math.sin(sigma) * config.MISSILE_SPEED[my.missile] 
        }
      };
      that.emit('shoot', d);
    }
  };


  /**
   * applies the forces from inputs
   */
  thrust = function(theta) {
    that.applyBP({x: Math.cos(theta), y: Math.sin(theta)}, {x: 0, y: 0});
    my.rotation = 0;
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
        

  fwk.method(that, 'desc', desc, _super);
  fwk.method(that, 'state', state, _super);

  fwk.method(that, 'thrust', thrust);
  fwk.method(that, 'shoot', shoot);

  fwk.getter(that, 'model', my, 'model');

  return that;
};

exports.ship = ship;
