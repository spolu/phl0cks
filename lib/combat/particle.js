var events = require('events');
var fwk = require('fwk');

var config = require('./config.js').config;


/**
 * Particle Object
 *
 * @extends events.EventEmitter
 *
 * @emits clear, destroy, collide
 * 
 * @param spec { id, owner, type, 
 *               invmass, radius
 *               position, 
 *               velocity }
 */
var particle = function(spec, my) {
  var my = my || {};

  my.id = spec.id || 'invalid';
  my.owner = spec.owner || 'nobody';
  my.type = spec.type || config.PARTICLE_TYPE;

  my.invmass = spec.invmass || 0;    
  my.radius = spec.radius || 0;  // collision detection

  my.position = spec.position || { x: 0, y:0 };
  my.velocity = spec.velocity || { x: 0, y:0 };

  my.force = { x: 0, y: 0 };
  my.integration_steps = 0;

  // public
  var apply;      /* apply({x, y}); */
  var integrate;  /* integrate(duration); */
  var simulate;   /* simulate(particle, step); */

  var desc;       /* desc() */
  var state;      /* state() */

  var collide;    /* collide(p) */
  var destroy;    /* destroy() */

  var clear;      /* clear() */


  var that = new events.EventEmitter();

  /** 
   * applies the force f to the particle
   * @param f {x, y}
   */
  apply = function(f) {	
    if(f && typeof f.x === 'number')
      my.force.x += f.x;
    if(f && typeof f.y === 'number')
      my.force.y += f.y;
  };

  /** 
   * integrates on duration
   * @param d duration
   */
  integrate = function(d) {
    // TOOD: add dampling if necessary
    my.velocity.x += my.force.x * my.invmass * d;
    my.velocity.y += my.force.y * my.invmass * d;	
    my.position.x += my.velocity.x * d;
    my.position.y += my.velocity.y * d;	

    my.integration_steps++;
    my.force = { x: 0, y: 0 };
  };

  /**
   * returns the description of the particle
   */
  desc = function() {
    return { 
      id: my.id,
      owner: my.owner,
      type: my.type,
      invmass: my.invmass,		 
      radius: my.radius,
      position: my.position,
      velocity: my.velocity 
    }; 
  };

  /**
   * returns the state of the particle
   */
  state = function() {
    return { 
      p: my.position,
      v: my.velocity
    };
  };


  /**
   * called when collision engine detects a collision with
   * another particle
   */
  collide = function(p) {
    that.emit('collide', p);
  };

  /**
   * called on destruction, emits an event for that
   */
  destroy = function() {
    that.emit('destroy');
  };

  /**
   * do anything necessary when cleared from simu
   */
  clear = function() {
    that.emit('clear');
  };

  /**
   * simulate n steps ahead of time simulation is part
   * of a particle (after all it's a simulation)
   * @param l number of steps
   * @param step length of steps
   * @return array of position
   */
  simulate = function(l, d) {
    var vel = {x: my.velocity.x, y: my.velocity.y};
    var pos = {x: my.position.x, y: my.position.y};
    var d = d || config.STEP_TIME;
    var res = [];

    for(var i = 0; i < l; i ++) {
      var f = {x: 0, y: 0};
      if(my.invmass != 0) {
        var n = (pos.x * pos.x) + (pos.y * pos.y);
        var g =  config.GM  / (my.invmass * n);
        f = { x: - pos.x * g / Math.sqrt(n),
          y: - pos.y * g / Math.sqrt(n)};		
      }
      vel.x += f.x * my.invmass * d;
      vel.y += f.y * my.invmass * d;
      pos.x += vel.x * d;
      pos.y += vel.y * d;	

      res.push({x: pos.x, y: pos.y});
    }
    return res;
  };


  fwk.method(that, 'integrate', integrate);
  fwk.method(that, 'apply', apply);

  fwk.method(that, 'simulate', simulate);

  fwk.method(that, 'desc', desc);
  fwk.method(that, 'state', state);

  fwk.method(that, 'collide', collide);
  fwk.method(that, 'destroy', destroy);
  fwk.method(that, 'clear', clear);

  fwk.getter(that, 'id', my, 'id');
  fwk.getter(that, 'owner', my, 'owner');
  fwk.getter(that, 'type', my, 'type');

  fwk.getter(that, 'invmass', my, 'invmass');
  fwk.getter(that, 'radius', my, 'radius');
  fwk.getter(that, 'position', my, 'position');
  fwk.getter(that, 'velocity', my, 'velocity');
  fwk.getter(that, 'force', my, 'force');

  fwk.setter(that, 'invmass', my, 'invmass');
  fwk.setter(that, 'radius', my, 'radius');
  fwk.setter(that, 'position', my, 'position');
  fwk.setter(that, 'velocity', my, 'velocity');
  fwk.setter(that, 'force', my, 'force');

  return that;
};

exports.particle = particle;
