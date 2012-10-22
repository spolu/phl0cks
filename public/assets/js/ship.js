/**
 * Ship Object
 *
 * @extends pobj
 *
 * @param spec { id, owner, type,
 *               position, velocity,
 *               GL }
 */

var colors = {};

var ship = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.vx = spec.vx;

  // public
  var render;    /* render() */

  var that = pobj(spec, my);    

  if(!colors[my.owner]) {
    console.log('picking color for: ' + my.owner);
    colors[my.owner] = [Math.random(), Math.random(), Math.random(), 1];
  }

  /**
   * Renders the ship
   */
  render = function() {	
    my.vx.setColor(colors[my.owner]);
    my.vx.draw();
  };

  CELL.method(that, 'render', render, _super);

  return that;
};
