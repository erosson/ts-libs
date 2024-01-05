/**
 * Basic operations for a number type. All polynomial operations are constructed based on these.
 * 
 * We provide implementations for:
 * - javascript's built-in `number`, of course
 * - {@link https://mikemcl.github.io/decimal.js | Decimal.js}
 * - Any Decimal.js-compatible number, such as {@link https://patashu.github.io/break_infinity.js/index.html break_infinity.js}
 */
export interface PolyProperties<T> {
    /**
     * The number zero.
     * 
     * For `PolyProperties<number>`, this is `0`. For `PolyProperties<Decimal>`, it's `new Decimal(0)`
     */
    readonly zero: T;

    /**
     * The number one.
     * 
     * For `PolyProperties<number>`, this is `1`. For `PolyProperties<Decimal>`, it's `new Decimal(1)`
     */
    readonly one: T;

    /**
     * Are two numbers equal?
     * 
     * For `PolyProperties<number>`, this is `===`.
     */
    equals(a: T, b: T): boolean;

    /**
     * Add two numbers.
     * 
     * For `PolyProperties<number>`, this is `+`.
     */
    add(a: T, b: T): T;

    /**
     * Multiply a number by a Javascript builtin `number`.
     * 
     * For `PolyProperties<number>`, this is `*`.
     */
    mul(a: T, b: number): T;

    /**
     * Multiply a number by another number of this format.
     * 
     * For `PolyProperties<number>`, this is `*`, equivalent to {@link mul}. The distinction is useful for `PolyProperties<Decimal>` and other formats.
     */
    mulT(a: T, b: T): T;

    /**
     * Format a coefficient number.
     * 
     * For `PolyProperties<number>`, this is `.toString()`.
     */
    format(c: T, i: number): string;
}

/**
 * A polynomial, expressed as an array of numbers. `p[0]` is the constant.
 * 
 * https://en.wikipedia.org/wiki/Polynomial
 * 
 *     f(t) = p[0] + (p[1] * t) + (p[2] * t^2) + (p[3] * t^3) + ...
 * 
 * Polynomial functions require this type.
 * Construct polynomials with {@link PolynomialImpl.parse}:
 * 
 *     import Poly from "@erosson/polynomial"
 *     Poly.toString(Poly.parse([1,2,3]))  // "3 t^2 + 2 t + 1"
 * 
 * Internally, it's just an array of numbers. {@link PolynomialImpl.parse} ensures it's a valid polynomial.
 * 
 * @param T This polynomial's number type. You probably want Javascript's builtin numbers, as `Polynomial<number>`, but {@link Decimal | other formats} are supported.
 */
export type Polynomial<T> = readonly T[] & { readonly __polynomial: unique symbol };

/**
 * The polynomial implementation for a given type of number.
 * 
 * You probably want to use Javascript's builtin numbers. That's the default export:
 * 
 *     import Poly from "@erosson/polynomial"
 *     Poly.toString(Poly.parse([1,2,3]))  // "3 t^2 + 2 t + 1"
 * 
 * You can instantiate this class to support other kinds of numbers, as well.
 * See {@link PolyProperties} for how to construct these.
 * 
 *     import Decimal from "decimal.js"
 *     import {PolynomialImpl} from "@erosson/polynomial"
 *     const Poly = new PolynomialImpl({...})
 *     Poly.toString(Poly.parse([new Decimal(1), new Decimal(2), new Decimal(3)]))  // "3 t^2 + 2 t + 1"
 */
export class PolynomialImpl<T> {
    /**
     * The constant-term polynomial zero. Equivalent to `Poly.parse(0)`.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.zero.toString()  // "0"
     */
    public readonly zero: Polynomial<T>;

    /**
     * Construct a polynomial implementation for this type of number.
     * 
     * You probably want to use Javascript's builtin numbers. That's the default export:
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.toString(Poly.parse([1,2,3]))  // "3 t^2 + 2 t + 1"
     * 
     * You can instantiate this class to support other kinds of numbers, as well.
     * See {@link PolyProperties} for how to construct these.
     * 
     *     import Decimal from "decimal.js"
     *     import {PolynomialImpl} from "@erosson/polynomial"
     *     const Poly = new PolynomialImpl({...})
     *     Poly.toString(Poly.parse([new Decimal(1), new Decimal(2), new Decimal(3)]))  // "3 t^2 + 2 t + 1"
     */
    constructor(public impl: PolyProperties<T>) {
        this.zero = [impl.zero] as unknown as Polynomial<T>;
    }

    /**
     * Given a list of numbers, create a polynomial.
     * 
     *     import Poly from "@erosson/polynomial"
     *     const p = Poly.parse([1,2,3])
     *     p.toString()  // "3 t^2 + 2 t + 1"
     */
    parse(coeffs: readonly T[]): Polynomial<T> {
        const p = [...coeffs];
        // remove leading zeros
        while (p.length > 0 && this.impl.equals(this.impl.zero, p[p.length - 1] ?? this.impl.one)) {
            p.pop();
        }
        const r = p.length ? p : this.zero;
        return r as unknown as Polynomial<T>;
    }

    /**
     * Return the *degree* of this polynomial - the value of its highest exponent.
     * 
     * https://en.wikipedia.org/wiki/Degree_of_a_polynomial
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.degree(Poly.parse([1,2,3]))  // 2
     *     Poly.degree(Poly.parse([9,8,7,6]))  // 3
     *     Poly.degree(Poly.zero)  // 0
     */
    degree(p: Polynomial<T>): number {
        return p.length - 1;
    }

    /**
     * Is this polynomial a constant? That is, is its degree equal to zero?
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.isConstant(Poly.parse([1,2,3]))  // false
     *     Poly.isConstant(Poly.parse([1]))  // true
     *     Poly.isConstant(Poly.zero)  // true
     */
    isConstant(p: Polynomial<T>): boolean {
        return this.degree(p) <= 0;
    }

    /**
     * Return this polynomial's constant term.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.constantTerm(Poly.parse([1,2,3]))  // 1
     *     Poly.constantTerm(Poly.parse([1]))  // 1
     *     Poly.constantTerm(Poly.parse([9,8,7,6]))  // 9
     *     Poly.constantTerm(Poly.zero)  // 0
     */
    constantTerm(p: Polynomial<T>): T {
        return p[0] ?? this.impl.zero;
    }

    /**
     * Evaluate the polynomial at the given point.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.evaluate(Poly.parse([3,2]), 0)  // 3
     *     Poly.evaluate(Poly.parse([3,2]), 1)  // 5
     *     Poly.evaluate(Poly.parse([3,2]), 2)  // 7
     *     Poly.evaluate(Poly.parse([3,2,1]), 0)  // 3
     *     Poly.evaluate(Poly.parse([3,2,1]), 1)  // 6
     *     Poly.evaluate(Poly.parse([3,2,1]), 2)  // 11
     * 
     * You can also evaluate the nth degree of a polynomial.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.evaluate(Poly.parse([3,2,1]), 2, 0)  // 11 = 3 + 2*2 + 1*(2^2)
     *     Poly.evaluate(Poly.parse([3,2,1]), 2, 1)  // 6 = 2*2 + 1*(2^2)
     *     Poly.evaluate(Poly.parse([3,2,1]), 2, 2)  // 2 = 1*(2^2)
     */
    evaluate(p: Polynomial<T>, seconds: number, degree = 0): T {
        if (degree > 0) {
            p = this.parse(p.slice(degree).map((d, i) => this.impl.mul(d, degree + i)));
        }
        // special-case for quicker constants
        if (seconds === 0) return this.constantTerm(p);
        return p
            .map((c, index) => {
                const ft = Math.pow(seconds, index);
                return this.impl.mul(c, ft);
            })
            .reduce((a, b) => this.impl.add(a, b), this.impl.zero);
    }

    /**
     * Add two polynomials.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.add(Poly.parse([3,2,1]), Poly.parse([1,2,3]))  // [4,4,4]
     *     Poly.add(Poly.parse([3,2,1]), Poly.parse([5]))  // [8,2,1]
     *     Poly.add(Poly.parse([3,2,1]), Poly.zero)  // [3,2,1]
     */
    add(a: Polynomial<T>, b: Polynomial<T>): Polynomial<T> {
        return this.parse(zip(a, b).map(([ea, eb]) => this.impl.add(ea ?? this.impl.zero, eb ?? this.impl.zero)));
    }

    /**
     * Add a list of polynomials.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.sum([Poly.parse([3,2,1]), Poly.parse([1,2,3]), Poly.parse([1,1,1])])  // [5,5,5]
     */
    sum(ps: readonly Polynomial<T>[]): Polynomial<T> {
        return this.parse(ps.reduce((a, b) => this.add(a, b), this.zero));
    }

    /**
     * Multiply a polynomial by a scalar.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.mul(Poly.parse([3,2,1]), 5)  // [15,10,5]
     *     Poly.mul(Poly.parse([3,2,1]), 0)  // [0]
     */
    mul(p: Polynomial<T>, c: number): Polynomial<T> {
        return this.parse(p.map((v) => this.impl.mul(v, c)));
    }

    /**
     * Multiply a polynomial by a scalar. Similar to `mul`, but this one supports uses the same number format as your polynomial.
     * 
     *     import Poly from "@erosson/polynomial"
     *     Poly.mulT(Poly.parse([3,2,1]), 5)  // [15,10,5]
     *     Poly.mulT(Poly.parse([3,2,1]), 0)  // [0]
     */
    mulT(p: Polynomial<T>, c: T): Polynomial<T> {
        return this.parse(p.map((v) => this.impl.mulT(v, c)));
    }

    /**
     * Transform a polynomial to a list of `[formatted-coefficient, degree]`, suitable for string formatting.
     * You could use this to implement an HTML representation, for example.
     * 
     *     import Poly from "@erosson/polynomial"
     * 
     *     Poly.format(Poly.parse([3,2,1]))  // [["",2],["2 ",1],["3 ",0]]
     *     Poly.toString(Poly.parse([3,2,1]))  // "t^2 + 2 t + 3"
     * 
     *     Poly.format(Poly.parse([3,0,1]))  // [["",2],["0 ",1],["3 ",0]]
     *     Poly.toString(Poly.parse([3,0,1]))  // "t^2 + 0 t + 3"
     */
    format(p: Polynomial<T>): [string, number][] {
        return p.map((c, i) => [this.impl.format(c, i), i] as [string, number]).reverse();
    }

    /**
     * Transform a polynomial to a list of `[formatted-coefficient, degree]`, suitable for string formatting.
     * 
     *     import Poly from "@erosson/polynomial"
     * 
     *     Poly.formats(Poly.parse([3,2,1]))  // ["t^2", "2 t", "3"]
     *     Poly.toString(Poly.parse([3,2,1]))  // "t^2 + 2 t + 3"
     * 
     *     Poly.formats(Poly.parse([3,0,1]))  // ["t^2", "0 t", "3"]
     *     Poly.toString(Poly.parse([3,0,1]))  // "t^2 + 0 t + 3"
     */
    formats(p: Polynomial<T>): string[] {
        return this.format(p).map(([c, i]) => {
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
     *     import Poly from "@erosson/polynomial"
     *     Poly.toString(Poly.parse([3,2,1]))  // "t^2 + 2 t + 3"
     *     Poly.toString(Poly.parse([3,0,1]))  // "t^2 + 0 t + 3"
     */
    toString(p: Polynomial<T>): string {
        return this.formats(p).join(" + ");
    }
}

function zip<T>(a: readonly T[], b: readonly T[]): readonly (readonly [T | null, T | null])[] {
    if (a.length >= b.length) {
        return a.map((el, i) => [el, b[i] ?? null])
    } else {
        return b.map((el, i) => [a[i] ?? null, el])
    }
}