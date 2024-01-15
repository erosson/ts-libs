import { Chance } from "chance";
import { expect } from "vitest";
import { AffixSubject } from "./affix-class";
import { AffixSet, filterLevel, pickAffix } from "./affix-instance";
import { test2 } from "./test2";

test2('pick a random affix', ({ diablo2: mods }) => {
    const c = new Chance('seed')
    const set = new AffixSet(mods)
    const ringmods = set.filterSubject(AffixSubject.parse('ring'))
    expect(ringmods).toHaveLength(118)
    expect(filterLevel(ringmods, 40)).toHaveLength(92)
    expect(pickAffix(c, filterLevel(ringmods, 40)).affixId).toBe("372:Garnet")
})