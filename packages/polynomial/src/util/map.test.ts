import { expect, test } from "vitest";
import { groupBy } from "./map";

test('groupBy', () => {
    expect(groupBy([1, 2, 3, 4, 5, 6], n => n % 2 === 0 ? 'even' : 'odd'))
        .toEqual(new Map([['even', [2, 4, 6]], ['odd', [1, 3, 5]]]))
})