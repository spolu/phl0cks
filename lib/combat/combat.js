var events = require('events');
var fwk = require('fwk');

var config = require('./config.js').config;
var world = require('./world.js').world;

/**
 * Combat Object
 *
 * @extends {}
 *
 * @param spec { { user: phl0ck }, size }
 */
var combat = function(spec, my) {
  var my = my || {};
  var _super = {};

  my.world = world({});
  my.phl0cks = spec.phl0cks || {};

  // public
  var init;  // init();
  var run;   // start(status_);


};
