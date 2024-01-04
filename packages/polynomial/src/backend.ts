export interface PolyProperties<T> {
    readonly zero: T;
    readonly one: T;
    equals(a: T, b: T): boolean;
    add(a: T, b: T): T;
    mul(a: T, b: number): T;
    mulT(a: T, b: T): T;
    format(c: T, i: number): string;
}

/**
 * A polynomial. p[0] is the constant.
 * 
 * p[0] + (p[1] * t) + (p[2] * t^2) + (p[3] * t^3) + ...
 */
export type Polynomial<T> = readonly T[] & { readonly __polynomial: unique symbol };

export class PolynomialImpl<T> {
    public readonly zero: Polynomial<T>;

    constructor(public impl: PolyProperties<T>) {
        this.zero = [impl.zero] as unknown as Polynomial<T>;
    }

    parse(coeffs: readonly T[]): Polynomial<T> {
        const p = [...coeffs];
        // remove leading zeros
        while (p.length > 0 && this.impl.equals(this.impl.zero, p[p.length - 1] ?? this.impl.one)) {
            p.pop();
        }
        const r = p.length ? p : this.zero;
        return r as unknown as Polynomial<T>;
    }
    degree(p: Polynomial<T>): number {
        return p.length - 1;
    }
    isConstant(p: Polynomial<T>): boolean {
        return this.degree(p) <= 0;
    }

    constantTerm(p: Polynomial<T>): T {
        return p[0] ?? this.impl.zero;
    }
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
    add(a: Polynomial<T>, b: Polynomial<T>): Polynomial<T> {
        return this.parse(zip(a, b).map(([ea, eb]) => this.impl.add(ea ?? this.impl.zero, eb ?? this.impl.zero)));
    }
    sum(ps: readonly Polynomial<T>[]): Polynomial<T> {
        return this.parse(ps.reduce((a, b) => this.add(a, b), this.zero));
    }
    mul(p: Polynomial<T>, c: number): Polynomial<T> {
        return this.parse(p.map((v) => this.impl.mul(v, c)));
    }
    mulT(p: Polynomial<T>, c: T): Polynomial<T> {
        return this.parse(p.map((v) => this.impl.mulT(v, c)));
    }
    format(p: Polynomial<T>): [string, number][] {
        return p.map((c, i) => [this.impl.format(c, i), i] as [string, number]).reverse();
    }
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