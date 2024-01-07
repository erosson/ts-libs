import BDecimal from 'break_infinity.js';
import ODecimal from 'decimal.js';
import { expect, test } from "vitest";
import { NumberOps, decimalNumberOps, nativeNumberOps } from "./number-ops";
import { Polynomial } from "./polynomial";
import { simpleGraphToPolynomials } from "./production";
import * as MapUtil from './util/map';
import { factorial } from "./util/math";

function toCoeffs<K, D>(polys: ReadonlyMap<K, Polynomial<D>>): ReadonlyMap<K, readonly D[]> {
    return MapUtil.map(polys, p => p.coeffs)
}
function stepToPolynomials<V, D>(args: {
    vertices: readonly (readonly [V, D])[],
    edges: readonly { from: V, to: V, each: D }[],
    expected: readonly (readonly [V, readonly D[]])[],
    ops: NumberOps<D>,
}): void {
    const vertices = new Map(args.vertices)
    // first attempt:
    // const paths = allIncomingPaths(args.edges, Array.from(vertices.keys()))
    // const polys = pathsToPolynomials(args.ops, paths, {...
    //
    // simpler:
    //const polys = customGraphToPolynomials(args.ops, Array.from(vertices.keys()), args.edges, {
    //    each: e => e.each,
    //    count: v => vertices.get(v) as unknown as D,
    //})
    //
    // even simpler:
    const polys = simpleGraphToPolynomials(vertices, args.edges, args.ops)
    const coeffs = toCoeffs(polys)
    const expected = new Map(args.expected)
    expect(coeffs).toEqual(expected)
}

test('pathsToPolynomials: empty', () => {
    stepToPolynomials({
        vertices: [],
        edges: [],
        expected: [],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: empty edges', () => {
    stepToPolynomials({
        vertices: [['meat', 2], ['drone', 3]],
        edges: [],
        expected: [['drone', [3]], ['meat', [2]]],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: missing verts', () => {
    expect(() =>
        stepToPolynomials({
            vertices: [['drone', 3] /* meat is deliberately missing */],
            edges: [
                { from: 'drone', to: 'meat', each: 5 },
            ],
            expected: [/* not used */],
            ops: nativeNumberOps,
        })
    ).toThrowError("nullish count: meat")
})
test('pathsToPolynomials: string keys', () => {
    stepToPolynomials({
        vertices: [['meat', 2], ['drone', 3]],
        edges: [
            { from: 'drone', to: 'meat', each: 5 },
        ],
        expected: [['drone', [3]], ['meat', [2, 3 * 5]]],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: enum keys', () => {
    enum V {
        Meat,
        Drone,
    }
    stepToPolynomials({
        vertices: [[V.Meat, 2], [V.Drone, 3]],
        edges: [
            { from: V.Drone, to: V.Meat, each: 5 },
        ],
        expected: [[V.Drone, [3]], [V.Meat, [2, 3 * 5]]],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: decimal.js values', () => {
    const ctor = (n: number) => new ODecimal(n)
    stepToPolynomials({
        vertices: [['meat', ctor(2)], ['drone', ctor(3)]],
        edges: [
            { from: 'drone', to: 'meat', each: ctor(5) },
        ],
        expected: [['drone', [ctor(3)]], ['meat', [ctor(2), ctor(3 * 5)]]],
        ops: decimalNumberOps(ctor),
    })
})
test('pathsToPolynomials: break-infinity.js values', () => {
    const ctor = (n: number) => new BDecimal(n)
    stepToPolynomials({
        vertices: [['meat', ctor(2)], ['drone', ctor(3)]],
        edges: [
            { from: 'drone', to: 'meat', each: ctor(5) },
        ],
        expected: [['drone', [ctor(3)]], ['meat', [ctor(2), ctor(3 * 5)]]],
        ops: decimalNumberOps(ctor),
    })
})
test('pathsToPolynomials: parallel producers', () => {
    stepToPolynomials({
        vertices: [['meat', 2], ['drone', 3], ['drone2', 5]],
        edges: [
            { from: 'drone', to: 'meat', each: 7 },
            { from: 'drone2', to: 'meat', each: 11 },
        ],
        expected: [['drone', [3]], ['drone2', [5]], ['meat', [2, 3 * 7 + 5 * 11]]],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: producer chains', () => {
    stepToPolynomials({
        vertices: [['meat', 2], ['drone', 3], ['queen', 5], ['nest', 7]],
        edges: [
            { from: 'drone', to: 'meat', each: 11 },
            { from: 'queen', to: 'drone', each: 13 },
            { from: 'nest', to: 'queen', each: 17 },
        ],
        expected: [
            ['meat', [2, 3 * 11, 5 * 11 * 13 / factorial(2), 7 * 11 * 13 * 17 / factorial(3)]],
            ['drone', [3, 5 * 13, 7 * 13 * 17 / factorial(2)]],
            ['queen', [5, 7 * 17]],
            ['nest', [7]],
        ],
        ops: nativeNumberOps,
    })
})
test('pathsToPolynomials: disconnected graphs', () => {
    stepToPolynomials({
        vertices: [['meat', 2], ['drone', 3], ['meat2', 5], ['drone2', 7]],
        edges: [
            { from: 'drone', to: 'meat', each: 11 },
            { from: 'drone2', to: 'meat2', each: 13 },
        ],
        expected: [
            ['meat', [2, 3 * 11]],
            ['drone', [3]],
            ['meat2', [5, 7 * 13]],
            ['drone2', [7]],
        ],
        ops: nativeNumberOps,
    })
})