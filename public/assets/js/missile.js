/**
 * Missile Object
 *
 * @extends pobj
 *
 * @param spec { id, owner, type,
 *               position, velocity,
 *               GL }
 */
var missile = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.vx = voxel({ GL: spec.GL,
                  halfsize: 2});

  // public
  var render;    /* render() */

  var that = pobj(spec, my);    

  /**
   * Renders the missile
   */
  render = function() {	
    my.vx.setColor([0, 1, 0, 1]);
    my.vx.draw();
  };

  CELL.method(that, 'render', render, _super);

  return that;
};
