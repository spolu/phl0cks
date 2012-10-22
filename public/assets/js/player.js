
/**
 * Player Object
 *
 * @extends {}
 * 
 * @param spec {canvas, channel}
 */
var player = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.canvas = spec.canvas;
  my.channel = spec.channel;

  my.GL = GL({ canvas: my.canvas,
               fov: 45,
               near: 50,
               far: 5000,
               pos: [0, 0, -4730] }); 

  my.pobjs = [];
  
  // public
  var start;       /* start(); */

  // private
  var render;      /* render(); */
  var mvTo;        /* mvTo(body) */
  var spone;

  var that = {};

  /**
   * starts the player (engine, render, network)
   */
  start = function() {				
    // starts the render loop
    render();		    
	
    // connects to server to start streaming replay data. 
    my.socket = io.connect('/' + my.channel);
    my.msph = sphere({ GL: my.GL,
                       radius: 4 });
    my.ssph = sphere({ GL: my.GL,
                       radius: 20 });
	
    my.socket.on('step', function(data) {
      if(data.type === 'step') {
        my.pobjs = [];
        data.objects.forEach(function(obj) {
          switch(obj.type) {
            case 'missile': {
              var m = missile({ 
                id: obj.id,
                type: obj.type,
                owner: obj.owner,
                position: obj.p,
                velocity: obj.v,
                GL: my.GL,
                vx: my.msph
              });
              my.pobjs.push(m);
              break;
            }
            case 'ship': {
              var s = ship({ 
                id: obj.id,
                type: obj.type,
                owner: obj.owner,
                position: obj.p,
                velocity: obj.v,
                GL: my.GL,
                vx: my.ssph
              });
              my.pobjs.push(s);
              break;
            }
          }
        });
      }
    });
  };

  /**
   * move the gl model view matrix to the body position
   * @param body the body the model view is going to
   */
  mvTo = function(pobj) {
    mat4.identity(my.GL.mvMatrix());
    mat4.translate(my.GL.mvMatrix(), [pobj.position().x,
                                      pobj.position().y,
                                      0]);	
  };

  /**
   * renders the current scene
   */
  render = function() {
    my.GL.clear();

    my.pobjs.forEach(function(pobj) {
      my.GL.mvPushMatrix();
      mvTo(pobj);
      pobj.render();
      my.GL.mvPopMatrix();
    });

    my.GL.animationFrame(render);
  };
    

  CELL.method(that, 'start', start, _super);
    
  return that;
};
