### Phl0cks

Phl0cks is a programming game in which two or more programs control 
one or more spaceships in a SpaceWar-like environment with the goal of
eliminating every other enemy ships and survive as long as possible.

Since it is a SpaceWar-like environment, there is a physical simulation 
going on. Physics are simulated by simple newtonian integration with 
a predefined step.

Knwon as phl0cks, the programs are written in JavaScript and interfaced
with the simulation through a unique function `control` called at periodic 
interval in the simulation. The simulation runs for 5mn after which a draw
is declared.

Phl0cks must be entirely contained within a single file when submitted to
the engine. Each call to the `control` function should take no longer than
10ms. Additionally the memory used at any time should not exceed 100MB.


#### Simulation and Data Model

A pl0ck is a javascript file with the following structure. The file is executed
in a nodeJS module context so global variable as save to use within a phl0ck.

```javascript
/**
 * --------------
 * Initialization
 * --------------
 *
 *  The `init` function is called with the number of ships active per
 *  phl0cks in this game. The `init` function is a good place to
 *  initialize your data structure and prepare everything for the
 *  first call to control. Any global variable defined here will be
 *  preserved and accessible by the control function at each control
 *  phase.
 *
 * @param size number of ships per phl0ck
 * @param spec specifications of the simulated world
 */
exports.init = function(size, spec) {
  //
  // Your Implementation
  //
  return;
};

/**
 * -------
 * Control
 * -------
 *
 *  The `control` function is called at each control phase. The funciton
 *  is called once for every ship controlled by this fl0ck. The control
 *  function should implement your AI algorithm and return an object with
 *  two fields `theta` and `sigma`.
 *  `theta`  if defined the angle of the thrust to apply over the next
 *           control period (in radians)
 *  `sigma`  if defined the angle to use to shoot a new missile in the
 *           current simulation step if the ship still has missiles
 *
 * @param step     the current simulation step
 * @param t        the time equivalent of the current step in ms 
 * @param ship     the state and description of the ship to control 
 * @param ships    the array of all other ships still alive
 * @param missiles the array of all the missiles still in the wild
 *
 * @return { theta, sigma } control values
 */
exports.control = function(step, t, ship, ships, missiles) {
  //
  // Your Implementation
  //
  return { 
    theta: Math.random() * 2 * Math.PI,
    sigma: Math.random() * 2 * Math.PI
  };
};
```

