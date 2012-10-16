/**
 * World Specification Object
 */
var config = {
 
  HALFSIZE: 1000,
  
  STEP_TIME: 20,
  CONTROL_INTERVAL: 100,          // in ms
  COMBAT_INTERVAL: 1000 * 60,     // in mas

  SHIP_THRUST: 0.01,
  SHIP_RADIUS: 10,
  SHIP_INVMASS: 0.2,
  SHIP_INVINTERIA: 2,

  MISSILE_REFILL_INTERVAL: 200,   // ms 
  MISSILE_LIFESPAN: 1500,         // ms
  MISSILE_STOCK: 10,
  MISSILE_VELOCITY: 0.6,
  MISSILE_RADIUS: 2,
  MISSILE_INVMASS: 0.02,

  MAX_VELOCITY: 3
};

exports.config = config;
