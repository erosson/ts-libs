import { type NumberOps, nativeNumberOps } from "./number-ops";
import { BisectOptions, findRootBisect, findRootsQuick, isRootBisectable } from "./roots";
export { type IDecimal, decimalNumberOps } from "./number-ops"
export { type BisectOptions, type NumberOps, nativeNumberOps }

/**
 * A polynomial instance.
 * 
 *     import {Polynomial} from "@erosson/polynomial"
 *     const p = Polynomial.parse([3,2,1])
 *     p.toString()  // "t^2 + 2t + 3"
 */
export class Polynomial<T = number> {
  /**
   * @param coeffs The polynomial's coefficients. `coeffs[0]` is the constant term; `coeffs` of `[3,2,1]` are the polynomial `t^2 + 2 t + 3`
   * @param ops Fundamental operations for this polynomial's number type. Used to implement polynomials for {@link https://mikemcl.github.io/decimal.js/ | Decimal.js} or other non-builtin number types. If you're using the builtin number type, feel free to ignore it.
   */
  private constructor(public coeffs: readonly T[], public ops: NumberOps<T>) { }

  /**
   * Given a list of numbers, create a polynomial. The numbers are the polynomial's coefficients.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     const p = Polynomial.parse([1,2,3])
   *     p.toString()  // "3 t^2 + 2 t + 1"
   * 
   * @group constructors
   */
  static parse(coeffs: readonly number[]): Polynomial<number>
  /**
   * Given a list of numbers and a `NumberOps`, create a polynomial. The numbers are the polynomial's coefficients.
   * 
   *     import {Polynomial, decimalNumberOps} from "@erosson/polynomial"
   *     import Decimal from "decimal.js"
   *     const p = Polynomial.parse([new Decimal(1), new Decimal(2), new Decimal(3)], decimalNumberOps(Decimal))
   *     p.toString()  // "3 t^2 + 2 t + 1"
   * 
   * @group constructors
   */
  static parse<T>(coeffs: readonly T[], ops: NumberOps<T>): Polynomial<T>
  static parse(coeffs: readonly unknown[], ops: NumberOps<unknown> = nativeNumberOps): Polynomial<unknown> {
    const p = [...coeffs];
    // remove leading zeros
    while (p.length > 0 && ops.equals(ops.zero, p[p.length - 1] ?? ops.one)) {
      p.pop();
    }
    const r = p.length ? p : [ops.zero];
    return new Polynomial(r, ops)
  }

  /**
   * The constant-term polynomial zero. Equivalent to `Polynomial.parse(0)`.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.zero().toString()  // "0"
   * 
   * @group constructors
   */
  static zero(): Polynomial<number>
  /**
   * The constant-term polynomial zero. Equivalent to `Polynomial.parse(0)`.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.zero(decimalNumberOps(Decimal)).toString()  // "0"
   * 
   * @group constructors
   */
  static zero<T>(ops: NumberOps<T>): Polynomial<T>
  static zero(ops: NumberOps<unknown> = nativeNumberOps): Polynomial<unknown> {
    return Polynomial.parse([ops.zero], ops)
  }

  /**
   * Return the *degree* of this polynomial - the value of its highest exponent.
   * 
   * https://en.wikipedia.org/wiki/Degree_of_a_polynomial
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([1,2,3]).degree  // 2
   *     Polynomial.parse([9,8,7,6]).degree  // 3
   *     Polynomial.parse([9,8,7,6]).degree  // 3
   *     Polynomial.zero().degree  // 0
   */
  get degree(): number {
    return this.coeffs.length - 1;
  }

  /**
   * Is this polynomial a constant? That is, is its degree equal to zero?
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([1,2,3]).isConstant  // false
   *     Polynomial.parse([1]).isConstant  // true
   *     Polynomial.zero().isConstant  // true
   */
  get isConstant(): boolean {
    return this.degree <= 0;
  }
  /**
   * Return this polynomial's constant term.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([1,2,3]).constantTerm  // 1
   *     Polynomial.parse([1]).constantTerm  // 1
   *     Polynomial.parse([9,8,7,6]).constantTerm  // 9
   *     Polynomial.zero().constantTerm  // 0
   */
  get constantTerm(): T {
    return this.coeffs[0] ?? this.ops.zero;
  }

  /**
   * Evaluate the polynomial at the given point.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2]).evaluate(0)  // 3
   *     Polynomial.parse([3,2]).evaluate(1)  // 5
   *     Polynomial.parse([3,2]).evaluate(2)  // 7
   *     Polynomial.parse([3,2,1]).evaluate(0)  // 3
   *     Polynomial.parse([3,2,1]).evaluate(1)  // 6
   *     Polynomial.parse([3,2,1]).evaluate(2)  // 11
   * 
   * @group evaluate
   */
  evaluate(seconds: number): T {
    return this.evaluateDegree(seconds, 0)
  }

  /**
   * Evaluate the polynomial at the given point, with the given degree.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).evaluateDegree(2, 0)  // 11 = 3 + 2*2 + 1*(2^2)
   *     Polynomial.parse([3,2,1]).evaluateDegree(2, 1)  // 6 = 2*2 + 1*(2^2)
   *     Polynomial.parse([3,2,1]).evaluateDegree(2, 2)  // 2 = 1*(2^2)
   * 
   * @group evaluate
   */
  evaluateDegree(seconds: number, degree: number): T {
    let p: Polynomial<T> = this
    if (degree > 0) {
      p = Polynomial.parse(p.coeffs.slice(degree).map((d, i) => this.ops.mul(d, degree + i)), this.ops);
    }
    // special-case for quicker constants
    if (seconds === 0) return p.constantTerm
    return p.coeffs
      .map((c, index) => {
        const ft = Math.pow(seconds, index);
        return this.ops.mul(c, ft);
      })
      .reduce((a, b) => this.ops.add(a, b), this.ops.zero);
  }

  /**
   * Add two polynomials.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).add(Polynomial.parse([1,2,3]))  // [4,4,4]
   *     Polynomial.parse([3,2,1]).add(Polynomial.parse([5]))  // [8,2,1]
   *     Polynomial.parse([3,2,1]).add(Polynomial.zero())  // [3,2,1]
   * 
   * @group transforms
   */
  add(b: Polynomial<T>): Polynomial<T> {
    const coeffs = zip(this.coeffs, b.coeffs).map(([ea, eb]) => this.ops.add(ea ?? this.ops.zero, eb ?? this.ops.zero))
    return Polynomial.parse(coeffs, this.ops);
  }

  /**
   * Add a polynomial and some polynomial coefficients.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).add([1,2,3])  // [4,4,4]
   *     Polynomial.parse([3,2,1]).add([5])  // [8,2,1]
   *     Polynomial.parse([3,2,1]).add([])  // [3,2,1]
   * 
   * @group transforms
   */
  addCoeffs(b: readonly T[]): Polynomial<T> {
    // parse() is required to normalize the coefficients - don't reverse who calls who here
    return this.add(Polynomial.parse(b, this.ops))
  }

  /**
   * Add a list of polynomials.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).sum([Polynomial.parse([1,2,3]), Polynomial.parse([1,1,1])])  // [5,5,5]
   * 
   * See also {@link sums}
   * 
   * @group transforms
   */
  sum(bs: readonly Polynomial<T>[]): Polynomial<T> {
    return bs.reduce((a, b) => a.add(b), this)
  }

  /**
   * Add a list of polynomials.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.sums([Polynomial.parse([1,2,3]), Polynomial.parse([1,1,1])])  // [5,5,5]
   *     Polynomial.sums([])  // throws error
   * 
   * @group transforms
   */
  static sums<T>(ps: readonly Polynomial<T>[]): Polynomial<T> {
    const [head, ...tail] = ps
    if (!head) throw new Error('cannot sum an empty list of polynomials')
    return head.sum(tail)
  }

  /**
   * Add a list of polynomial-coefficients.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).sumCoeffs([[1,2,3], [1,1,1]])  // [5,5,5]
   *     Polynomial.parse([3,2,1]).sumCoeffs([])  // [3,2,1]
   * 
   * @group transforms
   */
  sumCoeffs(bs: readonly (readonly T[])[]): Polynomial<T> {
    return this.sum(bs.map(b => Polynomial.parse(b, this.ops)))
  }

  /**
   * Multiply a polynomial by a scalar.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).mul(5)  // [15,10,5]
   *     Polynomial.parse([3,2,1]).mul(0)  // [0]
   * 
   * @group transforms
   */
  mul(c: number): Polynomial<T> {
    const coeffs = this.coeffs.map((v) => this.ops.mul(v, c))
    return Polynomial.parse(coeffs, this.ops)
  }

  /**
   * Multiply a polynomial by a scalar. Similar to `mul`, but this one supports uses the same number format as your polynomial.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).mulT(5)  // [15,10,5]
   *     Polynomial.parse([3,2,1]).mulT(0)  // [0]
   * 
   * @group transforms
   */
  mulT(c: T): Polynomial<T> {
    const coeffs = this.coeffs.map((v) => this.ops.mulT(v, c))
    return Polynomial.parse(coeffs, this.ops)
  }

  /**
   * True if the given value is a root of this polynomial - that is, if `evaluate(t) === 0` for this t.
   * 
   * @param tolerance floating point imprecision allowed for this to return true
   * 
   * @group roots
   */
  isRoot(t: number, tolerance = 1e-2): boolean {
    // `toNumber` is safe, roots should be very close to zero
    const value = this.ops.toNumber(this.evaluate(t));
    const isRoot = tolerance === 0 ? value === 0 : Math.abs(value) < tolerance;
    return isRoot;
  }

  /**
   * Will `{@link findRootsQuick}` work for this polynomial?
   * 
   * True if degree 3 or less, or (trivially) if the constant term is zero.
   * 
   * @group roots
   */
  get isRootQuick(): boolean {
    return this.degree <= 3 || this.ops.equals(this.constantTerm, this.ops.zero)
  }

  /**
   * Try to find at least one root of this polynomial - that is, the values of `t` where `evaluate(t) === 0`.
   * 
   * For polynomials with degree <= 3, we use exact formulas to find one. For larger polynomials, we use an iterative method, which will be slower and less accurate.
   * 
   * @todo polynomials with degree >= 4 not yet implemented, throw an error
   * 
   * https://en.wikipedia.org/wiki/Polynomial_root-finding_algorithms
   * 
   * @group roots
   */
  findRootsQuick(): ReadonlySet<number> {
    const rawRoots = findRootsQuick(this);
    // remove dupes and NaNs
    return new Set(rawRoots.filter((r) => !isNaN(r)));
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
   * @group roots
   */
  get isRootBisectable(): boolean {
    return isRootBisectable(this)
  }

  /**
   * Try to find at least one root of this polynomial - that is, the values of `t` where `evaluate(t) === 0`.
   * 
   * This uses bisection, which is slower than some other methods. Also, it only works for {@link isRootBisectable | bisectable polynomials}.
   * 
   * https://en.wikipedia.org/wiki/Bisection_method#Algorithm
   * 
   * @group roots
   */
  findRootBisect(opts: BisectOptions = {}): number {
    return findRootBisect(this, opts)
  }

  /**
   * Transform a polynomial to a list of `[formatted-coefficient, degree]`, suitable for string formatting.
   * You could use this to implement an HTML representation, for example.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   * 
   *     Polynomial.parse([3,2,1]).format()  // [["",2],["2 ",1],["3 ",0]]
   *     Polynomial.parse([3,2,1]).toString()  // "t^2 + 2 t + 3"
   * 
   *     Polynomial.parse([3,0,1]).format()  // [["",2],["0 ",1],["3 ",0]]
   *     Polynomial.parse([3,0,1]).toString()  // "t^2 + 0 t + 3"
   * 
   * @group rendering
   */
  format(): readonly (readonly [string, number])[] {
    return this.coeffs.map((c, i) => [this.ops.format(c, i), i] as [string, number]).reverse();
  }

  /**
   * Transform a polynomial to a list of `[formatted-coefficient, degree]`, suitable for string formatting.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   * 
   *     Polynomial.parse([3,2,1]).formats()  // ["t^2", "2 t", "3"]
   *     Polynomial.parse([3,2,1]).toString()  // "t^2 + 2 t + 3"
   * 
   *     Polynomial.parse([3,0,1]).formats()  // ["t^2", "0 t", "3"]
   *     Polynomial.parse([3,0,1]).toString()  // "t^2 + 0 t + 3"
   * 
   * @group rendering
   */
  formats(): string[] {
    return this.format().map(([c, i]) => {
      switch (i) {
        case 0:
          return c.trim();
        case 1:
          return `${c}t`.trim();
        default:
          return `${c}t^${i}`.trim();
      }
    });
  }

  /**
   * Render a polynomial as a string.
   * 
   * If you need custom formatting, start with {@link format} instead.
   * 
   *     import {Polynomial} from "@erosson/polynomial"
   *     Polynomial.parse([3,2,1]).toString()  // "t^2 + 2 t + 3"
   *     Polynomial.parse([3,0,1]).toString()  // "t^2 + 0 t + 3"
   * 
   * @group rendering
   */
  toString(): string {
    return this.formats().join(" + ");
  }
}

function zip<T>(a: readonly T[], b: readonly T[]): readonly (readonly [T | null, T | null])[] {
  if (a.length >= b.length) {
    return a.map((el, i) => [el, b[i] ?? null])
  } else {
    return b.map((el, i) => [a[i] ?? null, el])
  }
}