### Phl0ck

Phl0ck is a programming game in which two or more programs control 
one or more spaceships in a SpaceWar-like environment with the goal of
eliminating every other enemy ships and survive as long as possible.

Since it is a SpaceWar-like environment, there is a physical simulation 
going on. Physics are simulated by simple newtonian integration with 
a predefined step.

Knwon as phl0ck, the programs are written in JavaScript and interfaced
with the simulation through a unique function `control` called at each 
step of the simulation.

Phl0cks must be entirely contained within a single file when submitted to
the engine. Each call to the `control` function should take no longer than
100ms. Additionally the memory used at any time should not exceed 100MB.


#### Simulation and Data Model

```
/**
 * Control handler called at each step of the simulation
 * @param sim { t, { DELTA, MAX_SPEED, MAX_THRUST, MAX_ROTATION } }
 * @param ship { p, v, owner }
 * @param ships [ { p, v, owner, friendly } ]
 * @param missiles [ { p, v, owner, friendly } ]
 * @param cb(thrust, rotation, shoot) 
 *    thrust in [0, MAX_THRUST]
 *    rotation in [0, MAX_ROTATION]
 *    shoot boolean
 */

function control(sim, ship, ships, missiles, cb);
```

#### Usage

```
phl0ck signup
phl0ck login
phl0ck challenge new user path
phl0ck challenge list
phl0ck challenge accept index path
phl0ck train path1 path2
phl0ck boilerplate path 
```

