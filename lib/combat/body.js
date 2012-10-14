var fwk = require('fwk');

var config = require('./config.js').config;
var particle = require('./particle.js').particle;

/**
 * Body Object
 *
 * @extends particle
 *
 * @emits clear, destroy, collide
 * 
 * @param spec { id, owner, type,
 *               invmass, invinertia, radius,
 *               position, orientation,
 *               velocity, rotation }
 */
var body = function(spec, my) {
  var my = my || {};
  var _super = {};

  spec.type = spec.type || config.BODY_TYPE;

  my.invinertia = spec.invinertia || 0;
  my.orientation = spec.orientation || 0;
  my.rotation = spec.rotation || 0;

  my.torque = 0;

  // public
  var apply;          /* apply({x, y}, t); */
  var applyWP;        /* apply({x, y}, {x, y}); */
  var applyBP;        /* apply({x, y}, {x, y}); */
  var integrate;      /* integrate(duration); */

  var desc;       /* desc() */
  var state;      /* state() */

  var that = particle(spec, my);

  /** 
   * applies the force f and torque t to the obj
   * @param f {x, y} force
   * @param t torque 
   */
  apply = function(f, t) {		
    _super.apply(f);
    if(typeof t === 'number')
      my.torque += t;
  };

  /**
   * applies the force f at world point pt
   * @param f {x, y} force
   * @param pt {x,y} world point
   */
  applyWP = function(f, pt) {
    var p = { 
      x: pt.x - my.position.x,
      y: pt.y - my.position.y 
    };
    var t = p.x*f.y - p.y*f.x;
    apply(f, t);
  };

  /**
   * applies the force f at body point pt
   * @param f {x, y} force
   * @param pt {x,y} world point
   */
  applyBP = function(f, pt) {	
    var p = { 
      x: my.position.x + pt.x * Math.cos(my.rotation) - pt.y * Math.sin(my.orientation),
      y: my.position.y + pt.x * Math.sin(my.rotation) + pt.y * Math.cos(my.orientation) 
    };
    var ft = { 
      x: f.x * Math.cos(my.orientation) - f.y * Math.sin(my.orientation),
      y: f.x * Math.sin(my.orientation) + f.y * Math.cos(my.orientation) 
    };
    applyWP(ft, p);
  };

  /** 
   * integrates on duration
   * @param d duration
   */
  integrate = function(d) {
    // TOOD: add dampling if necessary
    my.rotation += my.torque * my.invinertia * d;
    my.orientation += my.rotation * d;
    my.torque = 0;
    _super.integrate(d);
  };

  /**
   * returns the description of the body
   */
  desc = function() {
    var d = _super.desc();
    d.invinertia = my.invinertia;
    d.orientation = my.orientation;
    d.rotation = my.rotation;
    return d;
  };

  /**
   * returns the state of the body
   */
  state = function() {
    var s = _super.state();
    s.o = my.orientation;
    s.r = my.rotation;
    return s;
  };


  fwk.method(that, 'integrate', integrate, _super);
  fwk.method(that, 'apply', apply, _super);
  fwk.method(that, 'applyWP', applyWP, _super);
  fwk.method(that, 'applyBP', applyBP, _super);

  fwk.method(that, 'desc', desc, _super);
  fwk.method(that, 'state', state, _super);

  fwk.getter(that, 'invinertia', my, 'invinertia');
  fwk.getter(that, 'orientation', my, 'orientation');
  fwk.getter(that, 'rotation', my, 'rotation');

  return that;
};

exports.body = body;
