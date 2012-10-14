var fwk = require('fwk');

var config = require('./config.js').config;
var body = require('./body.js').body;

/**
 * Planet Object
 *
 * @extends body
 *
 * @param spec { id, owner, type, model
 *               invmass, invinertia, radius,
 *               position, orientation,
 *               velocity, rotation }
 */
var planet = function(spec, my) {
  var my = my || {};
  var _super = {};        

  spec.type = spec.type || config.PLANET_TYPE;
  my.model = spec.model || config.DEFAULT_MODEL;

  // By default 0 invmass/invinertia
  my.invmass = spec.invmass || 0;
  my.invinertia = spec.invinertia || 0;

  // public
  var desc;       /* desc()  */
  var state;      /* state() */
  var update;     /* update(state) */

  var that = body(spec, my);

  /**
   * returns the description of the body
   */
  desc = function() {
    var d = _super.desc();
    d.model = my.model;
    return d;
  };

  fwk.method(that, 'desc', desc, _super);
  fwk.getter(that, 'model', my, 'model');

  return that;
};

exports.planet = planet;
