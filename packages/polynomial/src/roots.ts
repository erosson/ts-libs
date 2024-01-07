/**
 * Functions for computing polynomial roots.
 */
import { NumberOps } from "./number-ops";

interface IPolynomial<T> {
    readonly ops: NumberOps<T>
    readonly coeffs: readonly T[]
    readonly constantTerm: T
    evaluate(t: number): T
}

export function findRootsQuick<T>(poly: IPolynomial<T>): readonly number[] {
    const tuple = toCoeffsTuple(poly);
    const o = poly.ops
    if (poly.ops.equals(poly.constantTerm, poly.ops.zero)) return [0]
    switch (tuple.length) {
        case 0:
        case 1: {
            return [];
        }
        case 2: {
            // linear: x = -b/a
            const [b, a] = tuple;
            // return [-b / a];
            return [o.toNumber(o.divT(o.mul(b, -1), a))];
        }
        case 3: {
            // quadratic: x = [-b ± √(b2 – 4ac)]/2a
            const [c, b, a] = tuple;
            // const disc = b * b - 4 * a * c;
            const disc = o.sub(o.mulT(b, b), o.mul(o.mulT(a, c), 4))
            // const denom = 2 * a;
            const denom = o.mul(a, 2)
            // const sqrtDisc = Math.sqrt(disc);
            const sqrtDisc = o.sqrt(disc)
            // return [(-b + sqrtDisc) / denom, (-b - sqrtDisc) / denom];
            return [
                o.toNumber(o.divT((o.add(o.mul(b, -1), sqrtDisc)), denom)),
                o.toNumber(o.divT((o.sub(o.mul(b, -1), sqrtDisc)), denom)),
            ]
        }
        case 4: {
            // cubic: https://math.vanderbilt.edu/schectex/courses/cubic/
            // x = {q + [q2 + (r-p2)3]1/2}1/3   +   {q - [q2 + (r-p2)3]1/2}1/3   +   p
            // where
            // p = -b/(3a),   q = p3 + (bc-3ad)/(6a2),   r = c/(3a)
            const [d, c, b, a] = tuple;
            // const p = -b / (3 * a);
            const p = o.divT(o.mul(b, -1), o.mul(a, 3))
            // const q = Math.pow(p, 3) + (b * c - 3 * a * d) / (6 * Math.pow(a, 2));
            const q = o.add(o.pow(p, 3), o.divT(o.sub(o.mulT(b, c), o.mul(o.mulT(a, d), 3)), o.mul(o.mulT(a, a), 6)))
            // const r = c / (3 * a);
            const r = o.divT(c, o.mul(a, 3))
            // const disc = Math.pow(q, 2) + Math.pow(r - Math.pow(p, 2), 3);
            const disc = o.add(o.mulT(q, q), o.pow(o.sub(r, o.mulT(p, p)), 3));
            // const sqrtDisc = Math.sqrt(disc);
            const sqrtDisc = o.sqrt(disc);
            // return [p + Math.cbrt(q + sqrtDisc) + Math.cbrt(q - sqrtDisc)];
            return [o.toNumber(o.add(o.add(p, o.cbrt(o.add(q, sqrtDisc))), o.cbrt(o.sub(q, sqrtDisc))))];
        }
        default: {
            // TODO use newton's method for higher-degree polynomials
            throw new Error(
                `roots of polynomials of degree ${tuple.length - 1} (length ${tuple.length
                }) not yet implemented`
            );
        }
    }
}

/**
 * because the return type has better destructuring
 */
function toCoeffsTuple<T>(poly: IPolynomial<T>):
    | readonly [T]
    | readonly [T, T]
    | readonly [T, T, T]
    | readonly [T, T, T, T]
    | readonly T[] {
    if (poly.coeffs[1] == null) return poly.coeffs as [T];
    if (poly.coeffs[2] == null) return poly.coeffs as unknown as [T, T];
    if (poly.coeffs[3] == null) return poly.coeffs as unknown as [T, T, T];
    if (poly.coeffs[4] == null) return poly.coeffs as unknown as [T, T, T, T];
    return poly.coeffs;
}

/**
 * Does this polynomial start negative, grow continuously, and eventually become non-negative?
 * 
 * - is the constant term `coeffs[0]` negative?
 * - are all non-constant terms `coeffs[1..]` non-negative?
 * 
 * That is, does it look like:
 * 
 *     -p0 + p1 t + p2 t^2 + p3 t^3 + ...
 * 
 * If so, we can bisect it to approximate a root.
 * 
 * Bisection can solve for other kinds of roots, of course, but we don't implement them here.
 */
export function isRootBisectable<T>(poly: IPolynomial<T>): boolean {
    const nonconstantTerms = poly.coeffs.slice(1)
    return poly.ops.lt(poly.constantTerm, poly.ops.zero)
        && nonconstantTerms.length > 0
        && nonconstantTerms.every(c => poly.ops.gte(c, poly.ops.zero))
}
export interface BisectOptions {
    // TODO specify the stopping point with tolerance instead
    iterations?: number
}
export function findRootBisect<T>(poly: IPolynomial<T>, opts: BisectOptions = {}): number {
    const [p0, ...ps] = poly.coeffs
    const max = findRootBisectMax(p0, ps, poly.ops)
    if (!isRootBisectable(poly) || p0 == null || max == null) throw new Error('not bisectable')
    // only `number` roots are supported, not `T`
    const maxN = poly.ops.toNumber(max)
    if (!isFinite(maxN)) throw new Error('not bisectable: max-bound is too large')
    return _findRootBisect(poly, 0, maxN, opts.iterations ?? 20)
}
export function _findRootBisect<T>(poly: IPolynomial<T>, min: number, max: number, iterations: number): number {
    const { ops } = poly
    // try the midpoint of these two bounds
    let ti = (max + min) / 2
    for (let i = 0; i < iterations; i++) {
        const result = poly.evaluate(ti)
        // console.log('bisect', { i, ti, min: min + '', max: max + '', result: result + '' })
        if (ops.equals(result, ops.zero)) {
            // exact match, quit early. this will almost never happen, though!
            return ti
        } else if (ops.lt(result, ops.zero)) {
            // ti is too low, increase the minimum to search higher
            min = ti
        } else {
            // ti is too high, decrease the maximum to search lower
            max = ti
        }
        ti = (max + min) / 2
    }
    // we're done iterating
    return ti
}

/**
 * Figure out the initial bounds for root bisection.
 * 
 * For bisectable roots - see {@link isRootBisectable} - we can find reasonable initial bounds for our bisection.
 * We can't compute the root of the entire polynomial in constant time, but we can compute the root of each term
 * with a bit of algebra:
 * 
 *     0 = -p0 + p1 t^1 : t = (p0 / p1) ^ (1/1)
 *     0 = -p0 + p2 t^2 : t = (p0 / p2) ^ (1/2)
 *     0 = -p0 + p3 t^3 : t = (p0 / p3) ^ (1/3)
 *     0 = ...
 *     0 = -p0 + pn t^n : t = (p0 / pn) ^ (1/n)
 * 
 * Because all non-constant terms are positive, the root of the entire polynomial must be less than the smallest
 * root of each of its terms. So, compute the root of each term, take the minimum, and that's where we cap our search!
 */
function findRootBisectMax<T>(p0: T, ps: readonly T[], ops: NumberOps<T>): T | null {
    function singleTermRoot(pn: T, iMinusOne: number): T | null {
        // break-infinity doesn't support infinities. ¯\_(ツ)_/¯
        // support it by special-casing null here instead
        if (ops.equals(ops.zero, pn)) return null

        const i = iMinusOne + 1
        // return Math.pow(p0 / pn, 1 / i)
        return ops.pow(ops.divT(ops.mul(p0, -1), pn), 1 / i)
    }

    // console.log('bisect-max', ps.map((p, i) => [p, i, singleTermRoot(p, i)]))
    return minimum(ps.map(singleTermRoot).filter(v => v != null), ops)
}

function minimum<T>(ns: readonly T[], ops: NumberOps<T>): T | null {
    const [head, ...tail] = ns
    if (head == null) return null
    return tail.reduce((accum, n) => ops.lt(accum, n) ? accum : n, head)
}