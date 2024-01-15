export { Polynomial } from './polynomial'
export { type NumberOps, nativeNumberOps, type IDecimal, decimalNumberOps } from "./number-ops"
export { type BisectOptions } from './roots'

/**
 * Implements the graph used by the {@link Production} module.
 */
export * as Graph from './graph'

/**
 * This module implements {@link https://www.swarmsim.com | Swarm Simulator}-style unit production.
 * It uses a graph describing the state of all units at time `t0`, and one polynomial per unit.
 * This module is abstract enough to use in other games that want a similar production style.
 * 
 * - The *vertices* of the graph are unit counts - how many of each unit the player has at time `t0`.
 * - The *edges* of the graph are unit productivity - how many `child-unit` one `parent-unit` produces each second.
 * 
 * Given this graph as input, this module has functions that output *production polynomials* -
 * one polynomial per unit, describing how many of that unit exist at any moment in time later than `t0`.
 * 
 * Calculating unit counts based on these polynomials takes a constant(ish) amount of time, no matter how far
 * into the future it is. This is a great property for an idle game with offline progress!
 */
export * as Production from './production'