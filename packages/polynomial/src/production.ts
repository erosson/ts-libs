import * as G from "./graph";
import { NumberOps, Polynomial } from "./polynomial";
import { factorial } from "./util/math";

export interface GetPoly<E, V, D> {
    each: (edge: E) => D;
    count: (vertex: V) => D;
}
export function vertsEdgesToPolynomials<V, E extends { from: V, to: V }, D>(
    ops: NumberOps<D>,
    verts: readonly V[],
    edges: readonly E[],
    fn: GetPoly<E, V, D>,
): ReadonlyMap<V, Polynomial<D>> {
    const paths = G.allIncomingPaths(edges, verts)
    return pathsToPolynomials(ops, paths, fn)
}

export function pathsToPolynomials<V, E, D>(
    ops: NumberOps<D>,
    paths: ReadonlyMap<V, readonly G.Path<V, E>[]>,
    fn: GetPoly<E, V, D>
): ReadonlyMap<V, Polynomial<D>> {
    return new Map(Array.from(paths.entries()).map(([k, p]) => [k, pathsToPolynomial(ops, p, fn)]));
}
function pathsToPolynomial<V, E, D>(
    ops: NumberOps<D>,
    paths: readonly G.Path<V, E>[],
    fn: GetPoly<E, V, D>
): Polynomial<D> {
    return Polynomial.sums(paths.map((p) => pathToPolynomial(ops, p, fn)));
}
function pathToPolynomial<V, E, D>(
    ops: NumberOps<D>,
    path: G.Path<V, E>,
    fn: GetPoly<E, V, D>
): Polynomial<D> {
    const degree: number = path.path.length;
    const count: D = fn.count(path.from);
    if (count == null) {
        // types should prevent this, but just in case
        throw new Error(`nullish count: ${path.from}`)
    }
    const each: D = path.path.map((p) => fn.each(p)).reduce((a, b) => ops.mulT(a, b), ops.one);
    const coeff = ops.mul(ops.mulT(each, count), 1 / factorial(degree));
    return Polynomial.parse<D>([...Array<D>(degree).fill(ops.zero), coeff], ops);
}