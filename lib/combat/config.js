/**
 * World Specification Object
 */
var config = {
 
  HALFSIZE: 2000,
  
  STEP_TIME: 20,
  CONTROL_INTERVAL: 100,          // in ms
  COMBAT_INTERVAL: 1000 * 60,     // in ms

  SHIP_THRUST: 0.015,
  SHIP_RADIUS: 20,
  SHIP_INVMASS: 0.2,

  MISSILE_REFILL_INTERVAL: 400,   // ms 
  MISSILE_LIFESPAN: 1500,         // ms
  MISSILE_STOCK: 8,
  MISSILE_VELOCITY: 1.0,
  MISSILE_RADIUS: 4,
  MISSILE_INVMASS: 0.02,

  MAX_VELOCITY: 3
};

exports.config = config;
