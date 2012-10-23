/**
 * Player Object
 *
 * @extends {}
 *
 * @param spec { id, owner, type,
 *               position, velocity,
 *               player }
 */
var pobj = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.GL = spec.GL;

  my.id = spec.id;
  my.owner = spec.owner;
  my.type = spec.type;

  my.position = spec.position;
  my.velocity = spec.velocity;

  my.player = spec.player;

  // public
  var render;    /* render() */

  var that = {};

  /*
   * renders the object. this function should be
   * overriden by implementations of the `object`
   * interface
   */
  render = function() {	
    // nothing to do
  };

  CELL.method(that, 'render', render, _super);

  CELL.getter(that, 'id', my, 'id');
  CELL.getter(that, 'owner', my, 'owner');
  CELL.getter(that, 'type', my, 'type');
  CELL.getter(that, 'position', my, 'position');
  CELL.getter(that, 'velocity', my, 'velocity');

  return that;
 };
