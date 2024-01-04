import { describe, expect, expectTypeOf, test } from "vitest";
import * as P from "./polynomial";
import PN from "./polynomial";
import BDecimal from "break_infinity.js";
import ODecimal from "decimal.js";
import { PolynomialImpl } from "./backend";

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
        expect(PN.evaluate(PN.parse(p), t)).toEqual(o);
    });
    test.each(cases)(`poly.normalize %s`, ({ p }) => {
        expect(PN.parse(p)).toEqual(p);
        expect(PN.parse([...p, 0])).toEqual(p);
        expect(PN.parse([...p, 0, 0, 0, 0])).toEqual(p);
        expect(PN.parse([...p, 0, 1, 0, 0])).toEqual([...p, 0, 1]);
    });
    test("normalize([]) === [0]", () => {
        expect(PN.parse([])).toEqual([0]);
    });
    test("poly.toString()", () => {
        function step(poly: number[], expected: string) {
            expect(PN.toString(PN.parse(poly))).toBe(expected);
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
});

test('decimal types line up', () => {
    // const _assertBreakInfinityDecimalIsIDecimal: P.IDecimal<Decimal> = new Decimal(1)
    expectTypeOf(new BDecimal(0)).toMatchTypeOf<P.IDecimal<BDecimal>>(null as unknown as P.IDecimal<BDecimal>)
    expectTypeOf(new ODecimal(0)).toMatchTypeOf<P.IDecimal<ODecimal>>(null as unknown as P.IDecimal<ODecimal>)
    expectTypeOf(new BDecimal(0)).not.toMatchTypeOf<P.IDecimal<ODecimal>>(null as unknown as P.IDecimal<ODecimal>)
    expectTypeOf(new ODecimal(0)).not.toMatchTypeOf<P.IDecimal<BDecimal>>(null as unknown as P.IDecimal<BDecimal>)
    // expectTypeOf(new Decimal(0)).toMatchTypeOf<Decimal>(null as unknown as Decimal)
})

const PolyBDecimal = P.Decimal(n => new BDecimal(n))
const PolyODecimal = P.Decimal(n => new ODecimal(n))
interface DecimalCase<D extends P.IDecimal<D>> {
    Poly: PolynomialImpl<D>
    ctor: new (n: number) => D
    name: string
}
const decimalCases: DecimalCase<any>[] = [
    { Poly: PolyBDecimal, ctor: BDecimal, name: 'break-infinity.js' },
    { Poly: PolyODecimal, ctor: ODecimal, name: 'decimal.js' },
]
describe.each(decimalCases)("decimal: %s", ({ Poly, ctor }) => {
    test.each(cases)(`poly.calc() %s`, ({ p: n, t, o }) => {
        const p = n.map((c) => new ctor(c));
        expect(Poly.evaluate(Poly.parse(p), t)).toEqual(
            new ctor(o)
        );
    });
    test.each(cases)(`poly.normalize %s`, ({ p: n }) => {
        const p = n.map((c) => new ctor(c));
        expect(Poly.parse(p)).toEqual(p);
        const zero = new ctor(0);
        const one = new ctor(1);
        expect(Poly.parse([...p, zero])).toEqual(p);
        expect(Poly.parse([...p, zero, zero, zero, zero])).toEqual(p);
        expect(Poly.parse([...p, zero, one, zero, zero])).toEqual([...p, zero, one]);
    });
    test("normalize([]) === [0]", () => {
        expect(Poly.parse([])).toEqual([new ctor(0)]);
    });
    test("poly.toString()", () => {
        function step(ns: number[], expected: string) {
            const poly = ns.map((n) => new ctor(n));
            expect(Poly.toString(Poly.parse(poly))).toBe(expected);
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
});

// test('roots', () => {
// 	function step(rp: number[], expectedN: number[]) {
// 		const expected = expectedN.map((e) => Temporal.Duration.from({ seconds: e }));
// 		const p = PN.parse(rp);
// 		expect(P.findRoots(p)).toEqual(new Set(expected));
// 		for (const e of expected) {
// 			expect(P.isRoot(p, e)).toBe(true);
// 			// test cases are written to be integers, so zero-float-tolerance is fine
// 			expect(P.isRoot(p, e, 0)).toBe(true);
// 			// test cases are written to be farther apart than this
// 			expect(P.isRoot(p, e.add({ milliseconds: 100 }))).toBe(false);
// 		}
// 	}
// 	step([-8, 2], [4]);
// 	step([-32, 0, 2], [4, -4]);
// 	step([-128, 0, 0, 2], [4]);
//
// 	// this should be [4,-4], but it's not implemented
// 	expect(() => P.findRoots(P.Polynomial.parse([-512, 0, 0, 0, 2]))).toThrow(
// 		'roots of polynomials of degree 4 (length 5) not yet implemented'
// 	);
//
// 	step([], []);
// 	step([-2], []);
// });