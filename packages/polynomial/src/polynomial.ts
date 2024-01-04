import { PolynomialImpl } from "./backend";
export { type Polynomial, PolynomialImpl, type PolyProperties } from './backend'

/**
 * Polynomials composed of Javascript's built-in numbers.
 * 
 *     const p = Native.parse([3,2,1])
 *     p.toString()  // t^2 + 2t + 3
 */
export const Native = new PolynomialImpl<number>({
  zero: 0,
  one: 1,
  equals(a, b) {
    return a === b;
  },
  add(a, b) {
    return a + b;
  },
  mul(a, b) {
    return a * b;
  },
  mulT(a, b) {
    return a * b;
  },
  format(c, i) {
    if (c === 1 && i !== 0) return "";
    if (c === -1 && i !== 0) return "-";
    if (Math.abs(c) < 100) {
      if (Number.isInteger(c)) return `${c} `;
      return `${c.toPrecision(3)} `;
    }
    return `${c} `;
  },
});

// users not working with decimals can simply use the default export
export default Native

export interface IDecimal<T extends IDecimal<T>> {
  equals(this: T, a: number | T): boolean
  lessThan(this: T, a: number | T): boolean
  add(this: T, a: number | T): T
  mul(this: T, a: number | T): T
  abs(this: T): T
  floor(this: T): T
  toPrecision(n: number): string
  toString(): string
}

export function Decimal<T extends IDecimal<T>>(ctor: (n: number) => T): PolynomialImpl<T> {
  return new PolynomialImpl<T>({
    zero: ctor(0),
    one: ctor(1),
    equals(a, b) {
      return a.equals(b);
    },
    add(a, b) {
      return a.add(b);
    },
    mul(a, b) {
      return a.mul(b);
    },
    mulT(a, b) {
      return a.mul(b);
    },
    format(c, i) {
      // TODO we can probably generalize this better
      if (c.equals(1) && i !== 0) return "";
      if (c.equals(-1) && i !== 0) return "-";
      if (c.abs().lessThan(100)) {
        // crude isInteger
        if (c.floor().equals(c)) return `${c.toString()} `;
        return `${c.toPrecision(3)} `;
      }
      return `${c.toString()} `;
    },
  });
}

//export function isRoot(poly: Polynomial, t: Temporal.Duration, tolerance = 1e-2): boolean {
//	const calc_ = evaluate(poly, t);
//	// const isRoot_ = calc_ === 0;
//	const isRoot_ = tolerance === 0 ? calc_ === 0 : Math.abs(calc_) < tolerance;
//	// if (!isRoot_) console.log("isRoot", { poly, t, isRoot_, calc_ });
//	return isRoot_;
//}
//export function findRoots(poly: Polynomial): Set<Temporal.Duration> {
//	const rawRoots = _findRoots(poly);
//	// remove dupes and NaNs
//	return new Set(
//		rawRoots.filter((r) => !isNaN(r)).map((r) => Temporal.Duration.from({ seconds: r }))
//	);
//}
//function toDegreeTuple(
//	poly: Polynomial
//):
//	| [number]
//	| [number, number]
//	| [number, number, number]
//	| [number, number, number, number]
//	| number[] {
//	// because typescript destructuring in _findRoots is uncooperative
//	if (poly[1] == null) return poly as [number];
//	if (poly[2] == null) return poly as unknown as [number, number];
//	if (poly[3] == null) return poly as unknown as [number, number, number];
//	if (poly[4] == null) return poly as unknown as [number, number, number, number];
//	return poly;
//}
//function _findRoots(poly: Polynomial): number[] {
//	const tuple = toDegreeTuple(poly);
//	switch (tuple.length) {
//		case 0:
//		case 1: {
//			return [];
//		}
//		case 2: {
//			// linear: x = -b/a
//			const [b, a] = tuple;
//			return [-b / a];
//		}
//		case 3: {
//			// quadratic: x = [-b ± √(b2 – 4ac)]/2a
//			const [c, b, a] = tuple;
//			const disc = b * b - 4 * a * c;
//			const denom = 2 * a;
//			const sqrtDisc = Math.sqrt(disc);
//			return [(-b + sqrtDisc) / denom, (-b - sqrtDisc) / denom];
//		}
//		case 4: {
//			// cubic: https://math.vanderbilt.edu/schectex/courses/cubic/
//			// x = {q + [q2 + (r-p2)3]1/2}1/3   +   {q - [q2 + (r-p2)3]1/2}1/3   +   p
//			// where
//			// p = -b/(3a),   q = p3 + (bc-3ad)/(6a2),   r = c/(3a)
//			const [d, c, b, a] = tuple;
//			const p = -b / (3 * a);
//			const q = Math.pow(p, 3) + (b * c - 3 * a * d) / (6 * Math.pow(a, 2));
//			const r = c / (3 * a);
//			const disc = Math.pow(q, 2) + Math.pow(r - Math.pow(p, 2), 3);
//			const sqrtDisc = Math.sqrt(disc);
//			return [p + Math.cbrt(q + sqrtDisc) + Math.cbrt(q - sqrtDisc)];
//		}
//		default: {
//			// TODO use newton's method for higher-degree polynomials
//			throw new Error(
//				`roots of polynomials of degree ${poly.length - 1} (length ${
//					poly.length
//				}) not yet implemented`
//			);
//		}
//	}
//}