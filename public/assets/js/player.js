
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
  my.legend = spec.legend;

  my.channel = spec.channel;
  my.ctx = my.canvas.getContext("2d");
  my.ratio = 600 / 4000;

  my.pobjs = [];
  my.owners = {};

  my.colors = {};
  my.cc = 0;
  
  // public
  var start;       /* start(); */

  // private
  var render;      /* render(); */
  var color;       /* color(owner, type); */


  var that = {};

  /**
   * starts the player (engine, render, network)
   */
  start = function() {				
    // starts the render loop
    render();		    
	
    // connects to server to start streaming replay data. 
    my.socket = io.connect('/' + my.channel);
	
    my.socket.on('step', function(data) {
      if(data.type === 'step') {
        my.pobjs = [];
        my.owners = {};
        data.objects.forEach(function(obj) {
          switch(obj.type) {
            case 'missile': {
              var m = missile({ 
                id: obj.id,
                type: obj.type,
                owner: obj.owner,
                position: obj.p,
                velocity: obj.v,
                player: that
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
                player: that
              });
              my.pobjs.push(s);
              my.owners[obj.owner] = my.owners[obj.owner] || 0;
              my.owners[obj.owner]++;
              break;
            }
          }
        });
      }
    });

    my.socket.on('end', function() {
      my.stopped = true;
      render();
      my.socket.socket.disconnect();
      CELL.debug('--END');
    });
    my.socket.on('error', function(err) {
      my.stopped = true;
      my.socket.socket.disconnect();
      CELL.debug('--ERROR:');
      CELL.debug(err);
    });
  };


  /**
   * renders the current scene
   */
  render = function() {
    my.ctx.fillStyle = "rgb(5, 5, 15)";
    my.ctx.fillRect(0, 0, my.canvas.width, my.canvas.height);

    my.pobjs.forEach(function(pobj) {
      pobj.render(my.ctx, my.ratio);
    });

    $(my.legend).empty();
    for(var o in my.owners) {
      $(my.legend).append('<span class="owner" ' +
                          'style="color: ' + color(o) + '">' + o + 
                          '</span> ');
    }

    if(!my.stopped)
      setTimeout(render, 40);
  };

  /**
   * Assigns and return a color for each owner
   */
  color = function(owner, type) {
    if(!my.colors[owner]) {
      // quick hack to get at least 5-6 good looking colors
      my.cc += 127;
      my.colors[owner] = my.cc % 360;
    }
    if(type === 'missile') {
      ret = 'hsl(' + my.colors[owner] + ', 80%, 30%)';
    }
    ret = 'hsl(' + my.colors[owner] + ', 100%, 50%)';
    return ret;
  };
    

  CELL.method(that, 'start', start, _super);
  CELL.method(that, 'color', color, _super);
    
  return that;
};
