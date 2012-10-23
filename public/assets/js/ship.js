/**
 * Ship Object
 *
 * @extends pobj
 *
 * @param spec { id, owner, type,
 *               position, velocity }
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
  render = function(ctx, ratio) {	
    ctx.fillStyle = my.player.color(my.owner, my.type);
    ctx.beginPath();
    ctx.arc(300 + my.position.x * ratio, 
            300 + my.position.y * ratio, 
            4, 0, Math.PI*2, true); 
    ctx.closePath();
    ctx.fill();
  };

  CELL.method(that, 'render', render, _super);

  return that;
};
