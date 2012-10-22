/**
 * Ship Object
 *
 * @extends pobj
 *
 * @param spec { id, owner, type,
 *               position, velocity,
 *               GL }
 */
var ship = function(spec, my) {
  var my = my || {};
  var _super = {};

  // public
  var render;    /* render() */

  var that = pobj(spec, my);    


  /**
   * Renders the ship
   */
  render = function() {	
  };

  CELL.method(that, 'render', render, _super);

  return that;
};
