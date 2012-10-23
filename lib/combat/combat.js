var events = require('events');
var fwk = require('fwk');
var util = require('util');

var config = require('./config.js').config;
var world = require('./world.js').world;
var ship = require('./ship.js').ship;
var missile = require('./missile.js').missile;

/**
 * Combat Object
 *
 * @extends {}
 *
 * @param spec { size, [phl0cks] }
 */
var combat = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.size = spec.size;
  my.spec = config;
  my.phl0cks = spec.phl0cks || [];

  my.ships = {};
  my.missiles = {};

  my.world = world({});
  my.last_control = -Math.ceil(config.CONTROL_INTERVAL / config.STEP_TIME);

  // public
  var run;   // run(step_, control_, end_);

  // private
  var init;

  var that = {};

  /**
   * Initialization mainly in charge of creating world objects
   * and mapping their ids with their corresponding phl0cks
   */
  init = function() {
    var pos = 0;
    var all = my.phl0cks.length * my.size;

    my.phl0cks.forEach(function(ph) {
      ph.init(my.size, config);
      
      for(var i = 0; i < my.size; i ++) {
        (function(id) {
          my.ships[id] = { 
            sh: ship({ 
              id: id, 
              owner: ph.user(),
              position: {
                x: config.HALFSIZE * 0.9 * (2 * Math.random() - 1),
                y: config.HALFSIZE * 0.9 * (2 * Math.random() - 1)
              },
              velocity: {
                x: (2 * Math.random() - 1) * 0.3,
                y: (2 * Math.random() - 1) * 0.3
              }
            }),
            ph: ph,
            mc: 0
          };
          pos++;

          // clear handler
          my.ships[id].sh.on('clear', function() {
            delete my.ships[id];
          });

          // collide handler
          my.ships[id].sh.on('collide', function(b) {
            // prevents friendly collision
            if(b.owner() === my.ships[id].sh.owner() && b.type() !== 'ship')
              return;
            my.ships[id].sh.destroy();
          });

          // shoot handler
          my.ships[id].sh.on('shoot', function(d, s) {
            var id = s.id() + '-' + (++my.ships[s.id()].mc);
            my.missiles[id] = missile({
              id: id,
              owner: d.owner,
              position: d.position,
              velocity: d.velocity
            });

            my.missiles[id].on('clear', function() {
              delete my.missiles[id];
            });
            my.missiles[id].on('collide', function(b) {
              if(b.owner() === my.missiles[id].owner())
                return;
              my.missiles[id].destroy();
            });

            my.world.add(my.missiles[id]);
          });

          my.world.add(my.ships[id].sh);

        })(ph.user() + '-' + i);
      }
    });

  };


  /**
   * Main run loop function. The run loop will initialize and
   * run the combat simulation until it is finished. At each step and
   * each control phase, the corresponding callback will be called
   * to report the progress of the combat.
   * @param step_(step, world)
   *        callback called at each simulation step
   * @param control_(step, { id: { theta, sigma } }, world) 
   *        calback called with the result of each control phases
   * @param end_(winner, step, world)
   *        callback called at the end of the simulation
   */
  run = function(step_, control_, end_) {
    init();

    var control_phase = function() {
      // phl0ck independent state
      var state = {};

      my.phl0cks.forEach(function(ph) {
        state[ph] = { ships: [], missiles: [] };
        // ship array
        for(var i in my.ships) {
          if(i !== id) {
            state[ph].ships.push({ desc: my.ships[i].sh.desc(),
                                   state: my.ships[i].sh.state() });
          }
        }
        // missile array
        for(var i in my.missiles) {
          state[ph].missiles.push({ desc: my.missiles[i].desc(),
                                    state: my.missiles[i].state() });
        }
      });

      var control = {};
      for(var id in my.ships) {
        var c = my.ships[id].ph.control(my.world.step(),
                                        my.world.step() * config.STEP_TIME,
                                        { desc: my.ships[id].sh.desc(),
                                          state: my.ships[id].sh.state() },
                                        state[my.ships[id].ph].ships,
                                        state[my.ships[id].ph].missiles);
        // apply control result
        my.ships[id].sh.thrust(c.theta);
        my.ships[id].sh.shoot(c.sigma);

        control[id] = c;
      }

      // callback
      control_(my.world.step(), control, my.world);
    };

    while(1) {
      // end_
      if(my.world.step() * config.STEP_TIME >= config.COMBAT_INTERVAL) {
        if(typeof end_ === 'function')
          end_(null, my.world.step(), my.world);
        break;
      }
      var owners = []
      for(var i in my.ships) {
        owners.push(my.ships[i].sh.owner());
      }
      owners = fwk.unique(owners);
      if(owners.length === 1 && my.phl0cks.length > 1) {
        if(typeof end_ === 'function')
          end_(owners[0], my.world.step(), my.world);
        break;
      }
      if(owners.length === 0) {
        if(typeof end_ === 'function')
          end_(null, my.world.step(), my.world);
        break;
      }

      // control_ 
      if((my.world.step() - my.last_control) * config.STEP_TIME >= config.CONTROL_INTERVAL) {
        control_phase();
        my.last_control = my.world.step();
      }
      // step_
      if(typeof step_ === 'function')
        step_(my.world.step(), my.world);

      my.world.advance();
    }
  };


  fwk.method(that, 'run', run, _super);

  fwk.getter(that, 'size', my, 'size');
  fwk.getter(that, 'spec', my, 'spec');

  return that;
};

exports.combat = combat;
