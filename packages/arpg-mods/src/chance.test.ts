import { Chance } from "chance";
import { expect, test } from "vitest";
type Chance = Chance.Chance

test('chance lib basics', () => {
    const c1: Chance = new Chance('seed')
    const c2 = new Chance('seed')
    expect(c1.string()).toBe(c2.string())
    c1.string()
    expect(c1.string()).not.toBe(c2.string())
})
test('bad picks', () => {
    const c = new Chance()
    // can't pick from empty
    expect(() => c.pickone([])).toThrowError()
    expect(() => c.weighted([], [])).toThrowError()
    // can't pick from partial-empty
    expect(() => c.weighted(['a'], [])).toThrowError()
    expect(() => c.weighted([], [1])).toThrowError()
    // can't pick from mismatched
    expect(() => c.weighted(['a'], [1, 2])).toThrowError()
    expect(() => c.weighted(['a', 'b'], [1])).toThrowError()
})