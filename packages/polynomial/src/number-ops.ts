/**
 * Basic operations for a number type. All polynomial operations are constructed based on these.
 * 
 * We provide implementations for:
 * - javascript's built-in `number`, of course
 * - {@link https://mikemcl.github.io/decimal.js | Decimal.js}
 * - Any Decimal.js-compatible number, such as {@link https://patashu.github.io/break_infinity.js/index.html break_infinity.js}
 */
export interface NumberOps<T> {
    /**
     * The number zero.
     * 
     * For `NumberOps<number>`, this is `0`. For `NumberOps<Decimal>`, it's `new Decimal(0)`
     */
    readonly zero: T;

    /**
     * The number one.
     * 
     * For `NumberOps<number>`, this is `1`. For `NumberOps<Decimal>`, it's `new Decimal(1)`
     */
    readonly one: T;

    /**
     * Are two numbers equal?
     * 
     * For `NumberOps<number>`, this is `===`.
     */
    equals(a: T, b: T): boolean;

    /**
     * Add two numbers.
     * 
     * For `NumberOps<number>`, this is `+`.
     */
    add(a: T, b: T): T;

    /**
     * Multiply a number by a Javascript builtin `number`.
     * 
     * For `NumberOps<number>`, this is `*`.
     */
    mul(a: T, b: number): T;

    /**
     * Multiply a number by another number of this format.
     * 
     * For `NumberOps<number>`, this is `*`, equivalent to {@link mul}. The distinction is useful for `NumberOps<Decimal>` and other formats.
     */
    mulT(a: T, b: T): T;

    /**
     * Format a coefficient number.
     * 
     * For `NumberOps<number>`, this is `.toString()`.
     */
    format(c: T, i: number): string;
}

/**
 * Basic operations for Javascript's built-in number type.
 */
export const nativeNumberOps: NumberOps<number> = {
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
}

/**
 * A {@link https://mikemcl.github.io/decimal.js/ | Decimal.js-compatible number}.
 * This matches Decimal.js's interface, without adding an explcit Decimal.js dependency.
 * 
 * Tested with Decimal.js itself, and {@link https://patashu.github.io/break_infinity.js/index.html break_infinity.js}.
 * 
 * @param T The number type. An implementation for the `Decimal` type would be typed as `IDecimal<Decimal>`.
 */
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

class DecimalNumberOps<T extends IDecimal<T>> implements NumberOps<T> {
    constructor(public zero: T, public one: T) { }

    equals(a: T, b: T): boolean {
        return a.equals(b);
    }
    add(a: T, b: T) {
        return a.add(b);
    }
    mul(a: T, b: number) {
        return a.mul(b);
    }
    mulT(a: T, b: T) {
        return a.mul(b);
    }
    format(c: T, i: number) {
        // TODO we can probably generalize this better
        if (c.equals(1) && i !== 0) return "";
        if (c.equals(-1) && i !== 0) return "-";
        if (c.abs().lessThan(100)) {
            // crude isInteger
            if (c.floor().equals(c)) return `${c.toString()} `;
            return `${c.toPrecision(3)} `;
        }
        return `${c.toString()} `;
    }
}

/**
 * Basic operations for a {@link https://mikemcl.github.io/decimal.js/ | Decimal.js-compatible numbers}. Pass your number's constructor.
 * 
 *     decimalNumberOps(n => new Decimal(n))
 */
export function decimalNumberOps<T extends IDecimal<T>>(ctor: (n: number) => T): NumberOps<T> {
    return new DecimalNumberOps(ctor(0), ctor(1))
}
