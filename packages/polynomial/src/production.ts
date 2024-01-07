import { NumberOps, nativeNumberOps } from "./number-ops";
import * as G from "./graph";
import { Polynomial } from "./polynomial";
import { factorial } from "./util/math";

/**
 * This pair of functions describes how to turn your graph's vertices and edges into production numbers.
 * 
 * If your application has the following graph...
 * 
 *     type Edge = {from: string, to: string, each: number}
 *     const vertices = new Map([['drone', 3], ['meat', 2]])
 *     const edges: readonly Edge[] = [{from: 'drone', to: 'meat', each: 5}]
 * 
 * ...here's what you pass to production functions:
 * 
 *     const getters: GetPoly<Edge, string, number> = {
 *         each: (edge: Edge) => edge.each,
 *         count: (vertex: string) => vertices.get(vertex),
 *     }
 * 
 * Production graphs can be any shape you like, any format you like, as long as your `GetPoly` functions correctly describe
 * how to count each node and how much each edge produces.
 */
export interface GetPoly<E, V, D> {
    /**
     * How many children does each parent produce per second?
     */
    each: (edge: E) => D;
    /**
     * How many of this thing exist at t=0? `null` or `undefined` if no such vertex exists.
     */
    count: (vertex: V) => D | null | undefined;
}

/**
 * The simplest way to construct production polynomials from a graph of your unit production.
 * 
 * If your application has the following graph...
 * 
 *     type Edge = {from: string, to: string, each: number}
 *     const vertices = new Map([['drone', 3], ['meat', 2]])
 *     const edges: readonly Edge[] = [{from: 'drone', to: 'meat', each: 5}]
 * 
 * ...here's how to get your polynomials:
 * 
 *     const polynomials: ReadonlyMap<string, Polynomial<number>>
 *         = simpleGraphToPolynomials(vertices, edges)
 * 
 * If you need a more flexible graph format, see also {@link customGraphToPolynomials}.
 */
export function simpleGraphToPolynomials<V, E extends { from: V, to: V, each: number }>(
    vertices: ReadonlyMap<V, number>,
    edges: readonly E[],
): ReadonlyMap<V, Polynomial<number>>
export function simpleGraphToPolynomials<V, E extends { from: V, to: V, each: D }, D>(
    vertices: ReadonlyMap<V, D>,
    edges: readonly E[],
    ops: NumberOps<D>,
): ReadonlyMap<V, Polynomial<D>>
export function simpleGraphToPolynomials<V, E extends { from: V, to: V, each: unknown }>(
    vertices: ReadonlyMap<V, unknown>,
    edges: readonly E[],
    ops: NumberOps<unknown> = nativeNumberOps,
): ReadonlyMap<V, Polynomial<unknown>> {
    return customGraphToPolynomials(Array.from(vertices.keys()), edges, ops, {
        each: (edge: E) => edge.each,
        count: (vertex: V) => vertices.get(vertex),
    })
}
/**
 * Construct production polynomials from a graph of your unit production.
 * 
 * If your application has the following graph...
 * 
 *     type Edge = {from: string, to: string, each: number}
 *     const vertices = new Map([['drone', 3], ['meat', 2]])
 *     const edges: readonly Edge[] = [{from: 'drone', to: 'meat', each: 5}]
 * 
 * ...here's how to get your polynomials:
 * 
 *     import {nativeNumberOps} from "@erosson/polynomial"
 *     const polynomials: ReadonlyMap<string, Polynomial<number>>
 *         = customGraphToPolynomials(vertices, edges, {
 *             ops: nativeNumberOps,
 *             each: (edge: Edge) => edge.each,
 *             count: (vertex: string) => vertices.get(vertex),
 *         })
 * 
 * See also {@link graphPathsToPolynomials} for another way to construct these polynomials.
 * 
 * See also {@link simpleGraphToPolynomials} for something simpler, with more restrictions on your graph's format.
 */
export function customGraphToPolynomials<V, E, D>(
    verts: readonly V[],
    edges: readonly E[],
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D> & G.GetEdge<V, E>,
): ReadonlyMap<V, Polynomial<D>>
export function customGraphToPolynomials<V, E extends { from: V, to: V }, D>(
    verts: readonly V[],
    edges: readonly E[],
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D>,
): ReadonlyMap<V, Polynomial<D>>
export function customGraphToPolynomials<V, E, D>(
    verts: readonly V[],
    edges: readonly E[],
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D> & Partial<G.GetEdge<V, E>>,
): ReadonlyMap<V, Polynomial<D>> {
    const { from, to } = fn
    if (from && to) {
        const paths = G.allIncomingPaths(edges, verts, { from, to })
        return graphPathsToPolynomials(paths, ops, fn)
    } else {
        // this is safe, overload types guarantee edge types
        const edges_ = edges as unknown as (E & { from: V, to: V })[]
        const paths = G.allIncomingPaths(edges_, verts)
        return graphPathsToPolynomials(paths, ops, fn)
    }
}

/**
 * Construct production polynomials from the set of paths produced by {@link Graph.allIncomingPaths}.
 * 
 * If your application has the following graph...
 * 
 *     type Edge = {parent: string, child: string, each: number}
 *     const vertices = new Map([['drone', 3], ['meat', 2]])
 *     const edges: readonly Edge[] = [{parent: 'drone', child: 'meat', each: 5}]
 * 
 * ...here's how to get your polynomials:
 * 
 *     import {nativeNumberOps, Graph} from "@erosson/polynomial"
 *     const paths = Graph.allIncomingPaths(edges, Array.from(vertices.keys()), {
 *         from: (edge: Edge) => edge.parent,
 *         to: (edge: Edge) => edge.child,
 *     })
 *     const polynomials: ReadonlyMap<string, Polynomial<number>>
 *         = pathsToPolynomials(paths, nativeNumberOps, {
 *             each: (edge: Edge) => edge.each,
 *             count: (vertex: string) => vertices.get(vertex),
 *         })
 * 
 * You probably want {@link customGraphToPolynomials} instead, unless you need to inspect graph paths for some reason.
 * 
 * See also {@link simpleGraphToPolynomials} for something simpler, with more restrictions on your graph's format.
 */
export function graphPathsToPolynomials<V, E, D>(
    paths: ReadonlyMap<V, readonly G.Path<V, E>[]>,
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D>
): ReadonlyMap<V, Polynomial<D>> {
    return new Map(Array.from(paths.entries()).map(([k, p]) => [k, pathsToPolynomial(p, ops, fn)]));
}
function pathsToPolynomial<V, E, D>(
    paths: readonly G.Path<V, E>[],
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D>
): Polynomial<D> {
    return Polynomial.sums(paths.map((p) => pathToPolynomial(p, ops, fn)));
}
function pathToPolynomial<V, E, D>(
    path: G.Path<V, E>,
    ops: NumberOps<D>,
    fn: GetPoly<E, V, D>
): Polynomial<D> {
    const degree: number = path.path.length;
    const count = fn.count(path.from);
    if (count == null) {
        throw new Error(`nullish count: ${path.from}`)
    }
    const each: D = path.path.map((p) => fn.each(p)).reduce((a, b) => ops.mulT(a, b), ops.one);
    const coeff = ops.mul(ops.mulT(each, count), 1 / factorial(degree));
    return Polynomial.parse<D>([...Array<D>(degree).fill(ops.zero), coeff], ops);
}