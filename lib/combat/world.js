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
  var _super = {};
  
  my.all = [];    
  my.idx = {};
  my.owners = {};

  my.step = 0;

  // public
  var add;          /* add(particle); */
  var remove;       /* remove(id); */
  var clear;        /* clear() */
  var get;          /* get(id); */

  var advance;      /* step() */

    
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
    
    // #destroy => remove => #clear
    b.on('destroy', function() {
      that.remove(b.id());
    });
  };

  /**
   * Retrieves a particle by id
   * @param id particle id
   */
  get = function(id) {
    return my.idx[id];
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
   * Function to advance in time. step duration is
   * controlled by config.STEP_TIME
   */
  advance = function() {
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
      // integration
      a.integrate();
	    
      // boundaries
      var pos = a.position();
      if(pos.x > config.HALFSIZE || pos.x < -config.HALFSIZE ||
         pos.y > config.HALFSIZE || pos.y < -config.HALFSIZE) {
        a.destroy();
      }
    };

    // main loop
    for(var i = 0; i < my.all.length; i ++) {
      process(my.all[i]);
      for(var j = i+1; j < my.all.length; j ++) {
        collide(my.all[i], my.all[j]);
      }
    }

    my.step++;
  };

  fwk.method(that, 'advance', advance, _super);

  fwk.method(that, 'add', add, _super);
  fwk.method(that, 'get', get, _super);
  fwk.method(that, 'remove', remove, _super);
  fwk.method(that, 'clear', clear, _super);

  fwk.getter(that, 'idx', my, 'idx');
  fwk.getter(that, 'all', my, 'all');
  fwk.getter(that, 'owners', my, 'owners');

  fwk.getter(that, 'step', my, 'step');

  return that;
};

exports.world = world;
