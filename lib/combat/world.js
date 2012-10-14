var events = require('events');
var fwk = require('fwk');

var config = require('./config.js').config;
var particle = require('./particle.js').particle;
var body = require('./body.js').body;


/**
 * World object
 *
 * @extends events.EventEmitter
 * 
 * @param spec {}
 */
var world = function(spec, my) {
  var my = my || {};
  
  my.all = [];    
  my.idx = {};
  my.owners = {};

  // public
  var add;      /* add(particle); */
  var remove;   /* remove(id); */
  var clear;    /* clear() */

  // protected
  var step;    /* step(d) */
    
  var that = new events.EventEmitter();

  /**
   * adds an object to the simulation
   * @param b particle or subclass
   */
  add = function(b) {
    my.idx[b.id()] = b;
    my.all.push(b);
    my.owners[b.owner()] = my.owners[b.owner()] || [];
    my.owners[b.owner()].push(b.id());
    
    b.on('destroy', function() {
        that.remove(b.id());
      });
  };

  /**
   * removes an object from the simulation
   * @param id particle or subclass id
   */
  remove = function(id) {
    if(my.idx[id]) {
      var o = my.owners[my.idx[id].owner()];
      for(var i = 0; i < o.length; i++) {
        if(o[i] === id) {
          o.splice(i, 1);
          break;
        }	    
      }
      for(var i = 0; i < my.all.length; i++) {
        if(my.all[i].id() === id) {
          my.all[i].clear();
          my.all.splice(i, 1);
          break;
        }
      }
      delete my.idx[id];
    }
  };

  /** 
   * clear all object from owner or the whole
   * simulation if unspecified
   * @param owner (optional)
   */
  clear = function(owner) {
    if(typeof owner === 'undefined') {
      for(var i = 0; i < my.all.length; i ++) {
        my.all[i].clear();
      }
      my.all = [];
      my.idx = {};
      my.owners = {};
    }
    else {
      var r = my.owners[owner];
      if(typeof r !== 'undefined') {
        for(var i = 0; i < r.length; i ++) {
          for(var j = 0; j < my.all.length; j++) {
            if(my.all[j].id() === r[i]) {
              my.all[j].clear();
              my.all.splice(j, 1);
              break;
            }
          }
          delete my.idx[r[i]];		    
        }
        delete my.owners[owner];
      }
    }
  };

  /**
   * step function to advance in time
   * @param dt step duration
   */
  step = function(dt) {
    // collision detection
    var collide = function(a, b) {
      var d = Math.sqrt((a.position().x - b.position().x) * (a.position().x - b.position().x) +
                        (a.position().y - b.position().y) * (a.position().y - b.position().y));
      if(d <= a.radius() + b.radius()) {
        a.collide(b);
        b.collide(a);
      }
    };

    // physics simulation
    var process = function(a) {
      // gravity
      if(a.invmass() != 0) {
        var pos = a.position();
        var n = (pos.x * pos.x) + (pos.y * pos.y);
        var g =  config.GM  / (a.invmass() * n);
        var f = { x: - pos.x * g / Math.sqrt(n),
                  y: - pos.y * g / Math.sqrt(n)};		
        a.apply(f);
      }	    

      a.integrate(dt);
	    
      // wrap
      var pos = a.position();
      if(pos.x > config.HALFSIZE_X)
        pos.x -=  2 * config.HALFSIZE_X;
      if(pos.x < -config.HALFSIZE_X)
        pos.x += 2 * config.HALFSIZE_X;
      if(pos.y > config.HALFSIZE_X * config.RATIO)
        pos.y -=  2 * config.HALFSIZE_X * config.RATIO;
      if(pos.y < -config.HALFSIZE_X * config.RATIO)
        pos.y += 2 * config.HALFSIZE_X * config.RATIO;	    
    };

    // main loop
    for(var i = 0; i < my.all.length; i ++) {
      process(my.all[i]);
      for(var j = i+1; j < my.all.length; j ++) {
        collide(my.all[i], my.all[j]);
      }
    }
	
    my.last = new Date();	
  };

  fwk.method(that, 'step', step);

  fwk.method(that, 'add', add);
  fwk.method(that, 'remove', remove);
  fwk.method(that, 'clear', clear);

  fwk.getter(that, 'idx', my, 'idx');
  fwk.getter(that, 'all', my, 'all');
  fwk.getter(that, 'owners', my, 'owners');

  return that;
};

exports.world = world;
