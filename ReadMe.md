### Phl0cks

Phl0cks is a programming game in which two or more programs control 
one or more spaceships in a SpaceWar-like environment with the goal of
eliminating every other enemy ships and survive as long as possible.

Since it is a SpaceWar-like environment, there is a physical simulation 
going on. Physics are simulated by simple newtonian integration with 
a predefined step.

Knwon as phl0cks, the programs are written in JavaScript and interfaced
with the simulation through a unique function `control` called at each 
step of the simulation. The simulation runs for 5mn after which a draw
is declared.

Phl0cks must be entirely contained within a single file when submitted to
the engine. Each call to the `control` function should take no longer than
100ms. Additionally the memory used at any time should not exceed 100MB.


#### Simulation and Data Model

```javascript
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

#### Command-Line Controls

```
phl0cks signup
phl0cks login
phl0cks challenge new user path
phl0cks challenge list
phl0cks challenge accept index path
phl0cks train path1 path2
```

