import { expect, test } from "vitest";
import { factorial, product, range } from "./math";

test('product', () => {
    expect(product([3, 4, 5])).toBe(3 * 4 * 5)
    expect(product([1, 2, 3, 0])).toBe(0)
    expect(product([1, 2, 3])).toBe(2 * 3)
})
test('range', () => {
    expect(range(5)).toEqual([0, 1, 2, 3, 4])
    expect(range(0)).toEqual([])
    expect(range(1)).toEqual([0])
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4])
    expect(range(1, 5)).toEqual([1, 2, 3, 4])
})
test('factorial', () => {
    expect(factorial(0)).toBe(1)
    expect(factorial(1)).toBe(1)
    expect(factorial(2)).toBe(2)
    expect(factorial(3)).toBe(6)
    expect(factorial(4)).toBe(24)
    expect(factorial(5)).toBe(120)
})