import { describe, expect, expectTypeOf, test } from "vitest";
import * as P from "./polynomial";
import BDecimal from "break_infinity.js";
import ODecimal from "decimal.js";

type Case = { p: number[]; t: number; o: number };
const cases: Case[] = [
    { p: [0], t: 0, o: 0 },
    { p: [2], t: 0, o: 2 },
    { p: [2], t: 1, o: 2 },
    { p: [2], t: 2, o: 2 },
    { p: [2, 3], t: 0, o: 2 },
    { p: [2, 3], t: 1, o: 5 },
    { p: [2, 3], t: 2, o: 8 },
    { p: [2, 3], t: 3, o: 11 },
    { p: [2, 3, 1], t: 0, o: 2 },
    { p: [2, 3, 1], t: 1, o: 6 },
    { p: [2, 3, 1], t: 2, o: 12 },
    { p: [2, 3, 1], t: 3, o: 20 },
];

describe("native", () => {
    test.each(cases)(`poly.calc() %s`, ({ p, t, o }) => {
        expect(P.Polynomial.parse(p).evaluate(t)).toEqual(o);
    });
    test.each(cases)(`poly.normalize %s`, ({ p }) => {
        expect(P.Polynomial.parse(p).coeffs).toEqual(p);
        expect(P.Polynomial.parse([...p, 0]).coeffs).toEqual(p);
        expect(P.Polynomial.parse([...p, 0, 0, 0, 0]).coeffs).toEqual(p);
        expect(P.Polynomial.parse([...p, 0, 1, 0, 0]).coeffs).toEqual([...p, 0, 1]);
    });
    test("normalize([]) === [0]", () => {
        expect(P.Polynomial.parse([]).coeffs).toEqual([0]);
    });
    test("poly.toString()", () => {
        function step(poly: number[], expected: string) {
            expect(P.Polynomial.parse(poly).toString()).toBe(expected);
        }
        step([0], "0");
        step([1], "1");
        step([0], "0");
        step([1], "1");
        step([0, 1], "t + 0");
        step([2, 1], "t + 2");
        step([2, 3], "3 t + 2");
        step([2, 3, 4], "4 t^2 + 3 t + 2");
        step([2, 3, 1], "t^2 + 3 t + 2");
        step([2, 0, 1], "t^2 + 0 t + 2");
        step([-1], "-1");
        step([-2], "-2");
        step([0.5], "0.500");
        step([1.5], "1.50");
        step([-0.5], "-0.500");
        step([-1.5], "-1.50");
        step([9999], "9999");
        step([-9999], "-9999");
        step([0, -1], "-t + 0");
        step([0, -2], "-2 t + 0");
        step([0, 0.5], "0.500 t + 0");
        step([0, 1.5], "1.50 t + 0");
        step([0, -0.5], "-0.500 t + 0");
        step([0, -1.5], "-1.50 t + 0");
        step([0, 9999], "9999 t + 0");
        step([0, -9999], "-9999 t + 0");
    });

    test('quick roots', () => {
        function step(rp: number[], expected: number[], bisectable = true, every = false) {
            const p = P.Polynomial.parse(rp);
            expect(p.isRootQuick).toBe(true)
            expect(p.isRootBisectable).toBe(bisectable)
            expect(p.findRootsQuick()).toEqual(new Set(expected));
            for (const e of expected) {
                expect(p.isRoot(e)).toBe(true);
                // test cases are written to be integers, so zero-float-tolerance is fine
                expect(p.isRoot(e, 0)).toBe(true);
                // test cases are written to be farther apart than this
                expect(p.isRoot(e + 0.1)).toBe(every);
            }
        }
        step([-8, 2], [4]);
        step([-32, 0, 2], [4, -4]);
        step([-128, 0, 0, 2], [4]);

        // this should be [4,-4], but it's not implemented yet
        expect(() => P.Polynomial.parse([-512, 0, 0, 0, 2]).findRootsQuick()).toThrow(
            'roots of polynomials of degree 4 (length 5) not yet implemented'
        );

        step([], [0], false, true);
        step([-2], [], false);
    });
    test('bisect roots', () => {
        function step(rp: number[], expected: number) {
            const p = P.Polynomial.parse(rp);
            expect(p.isRootBisectable).toBe(true)
            const result = p.findRootBisect()
            // exact-equals won't work, this is an approximation
            expect(result - expected).toBeCloseTo(0);
            expect(p.isRoot(result)).toBe(true);
        }
        step([-512, 0, 0, 0, 2], 4)
    })
});

test('decimal types line up', () => {
    // const _assertBreakInfinityDecimalIsIDecimal: P.IDecimal<Decimal> = new Decimal(1)
    expectTypeOf(new BDecimal(0)).toMatchTypeOf<P.IDecimal<BDecimal>>(null as unknown as P.IDecimal<BDecimal>)
    expectTypeOf(new ODecimal(0)).toMatchTypeOf<P.IDecimal<ODecimal>>(null as unknown as P.IDecimal<ODecimal>)
    expectTypeOf(new BDecimal(0)).not.toMatchTypeOf<P.IDecimal<ODecimal>>(null as unknown as P.IDecimal<ODecimal>)
    expectTypeOf(new ODecimal(0)).not.toMatchTypeOf<P.IDecimal<BDecimal>>(null as unknown as P.IDecimal<BDecimal>)
    // expectTypeOf(new Decimal(0)).toMatchTypeOf<Decimal>(null as unknown as Decimal)
})

const BDecimalOps = P.decimalNumberOps(n => new BDecimal(n))
const ODecimalOps = P.decimalNumberOps(n => new ODecimal(n))
interface DecimalCase<D extends P.IDecimal<D>> {
    ops: P.NumberOps<D>
    ctor: (n: number) => D
    name: string
}
const decimalCases: DecimalCase<any>[] = [
    { ops: P.nativeNumberOps, ctor: n => n, name: 'native number' },
    { ops: BDecimalOps, ctor: n => new BDecimal(n), name: 'break-infinity.js' },
    { ops: ODecimalOps, ctor: n => new ODecimal(n), name: 'decimal.js' },
]
describe.each(decimalCases)("decimal: $name", ({ ops, ctor }) => {
    test.each(cases)(`poly.calc() %s`, ({ p: n, t, o }) => {
        const p = n.map(ctor)
        expect(P.Polynomial.parse(p, ops).evaluate(t)).toEqual(ctor(o));
    });
    test.each(cases)(`poly.normalize %s`, ({ p: n }) => {
        const p = n.map(ctor)
        expect(P.Polynomial.parse(p, ops).coeffs).toEqual(p);
        const zero = ctor(0);
        const one = ctor(1);
        expect(P.Polynomial.parse([...p, zero], ops).coeffs).toEqual(p);
        expect(P.Polynomial.parse([...p, zero, zero, zero, zero], ops).coeffs).toEqual(p);
        expect(P.Polynomial.parse([...p, zero, one, zero, zero], ops).coeffs).toEqual([...p, zero, one]);
    });
    test("normalize([]) === [0]", () => {
        expect(P.Polynomial.parse([], ops).coeffs).toEqual([ctor(0)]);
    });
    test("poly.toString()", () => {
        function step(ns: number[], expected: string) {
            const poly = ns.map(ctor);
            expect(P.Polynomial.parse(poly, ops).toString()).toBe(expected);
        }
        step([0], "0");
        step([1], "1");
        step([0], "0");
        step([1], "1");
        step([0, 1], "t + 0");
        step([2, 1], "t + 2");
        step([2, 3], "3 t + 2");
        step([2, 3, 4], "4 t^2 + 3 t + 2");
        step([2, 3, 1], "t^2 + 3 t + 2");
        step([2, 0, 1], "t^2 + 0 t + 2");
        step([-1], "-1");
        step([-2], "-2");
        step([0.5], "0.500");
        step([1.5], "1.50");
        step([-0.5], "-0.500");
        step([-1.5], "-1.50");
        step([9999], "9999");
        step([-9999], "-9999");
        step([0, -1], "-t + 0");
        step([0, -2], "-2 t + 0");
        step([0, 0.5], "0.500 t + 0");
        step([0, 1.5], "1.50 t + 0");
        step([0, -0.5], "-0.500 t + 0");
        step([0, -1.5], "-1.50 t + 0");
        step([0, 9999], "9999 t + 0");
        step([0, -9999], "-9999 t + 0");
    });

    test('quick roots', () => {
        function step(rp: number[], expected: number[], bisectable = true, every = false) {
            const p = P.Polynomial.parse(rp.map(ctor), ops);
            expect(p.isRootQuick).toBe(true)
            expect(p.isRootBisectable).toBe(bisectable)
            expect(p.findRootsQuick()).toEqual(new Set(expected));
            for (const e of expected) {
                expect(p.isRoot(e)).toBe(true);
                // test cases are written to be integers, so zero-float-tolerance is fine
                expect(p.isRoot(e, 0)).toBe(true);
                // test cases are (usually) written to be farther apart than this
                expect(p.isRoot(e + 0.1)).toBe(every);
            }
        }
        step([-8, 2], [4]);
        step([-32, 0, 2], [4, -4]);
        step([-128, 0, 0, 2], [4]);

        // this should be [4,-4], but it's not implemented yet
        expect(() => P.Polynomial.parse([-512, 0, 0, 0, 2].map(ctor), ops).findRootsQuick()).toThrow(
            'roots of polynomials of degree 4 (length 5) not yet implemented'
        );

        step([], [0], false, true);
        step([-2], [], false);
    });
    test('bisect roots', () => {
        function step(rp: number[], expected: number) {
            const p = P.Polynomial.parse(rp.map(ctor), ops);
            expect(p.isRootBisectable).toBe(true)
            const result = p.findRootBisect()
            // exact-equals won't work, this is an approximation
            // console.log('bisect', result, expected)
            expect(result - expected).toBeCloseTo(0);
            expect(p.isRoot(result)).toBe(true);
        }
        step([-512, 0, 0, 0, 2], 4)
    })
});