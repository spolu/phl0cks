/**
 * Configuration object
 */
var config = {
 
  HALFSIZE: 1000,
  
  STEP_TIME: 20,
  CONTROL_INTERVAL: 100,          // in ms

  PARTICLE_TYPE: 'particle',
  BODY_TYPE: 'body',
  SHIP_TYPE: 'ship',
  MISSILE_TYPE: 'missile',
  
  SHIP_THRUST: 0.01,
  SHIP_RADIUS: 10,

  MISSILE_REFILL_INTERVAL: 200,   // ms 
  MISSILE_LIFESPAN: 1500,         // ms
  MISSILE_STOCK: 10,
  MISSILE_VELOCITY: 0.6,
  MISSILE_RADIUS: 2,

  MAX_VELOCITY: 3
};

exports.config = config;
