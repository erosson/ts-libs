import Chance from "chance";
import { AffixClass, AffixFamily, AffixSubject, StatRange } from "./affix-class";
import { groupBy } from "./util/map";
type Chance = Chance.Chance

export interface AffixInstance {
    readonly cls: AffixClass
    readonly stats: readonly StatInstance[]
}
export interface StatInstance {
    readonly cls: StatRange
    readonly value: number
}

export interface AffixWeightEntry {
    readonly affix: AffixClass
    readonly subject: AffixSubject
    readonly weight: number
}
export class AffixSet {
    public readonly byWeight: ReadonlyMap<AffixSubject, readonly AffixWeightEntry[]>

    constructor(public readonly list: readonly AffixClass[]) {
        const entries: readonly AffixWeightEntry[] = list.flatMap(affix => affix.weight.map(w => ({ ...w, affix })))
        this.byWeight = groupBy(entries, e => e.subject)
    }

    // TODO multiple subjects, with merging
    filterSubject(subject: AffixSubject): readonly AffixWeightEntry[] {
        return this.byWeight.get(subject) ?? []
    }
}

export function filterLevel(affixes: readonly AffixWeightEntry[], level: number): readonly AffixWeightEntry[] {
    return affixes.filter(w => level >= w.affix.level)
        .filter(w => w.affix.maxLevel <= 0 || level <= w.affix.maxLevel)
}
export function filterFamilies(affixes: readonly AffixWeightEntry[], families: AffixFamily | ReadonlySet<AffixFamily>): readonly AffixWeightEntry[] {
    const fs = typeof families === 'string' ? new Set([families]) : families
    return affixes.filter(w => w.affix.families.every(f => !fs!.has(f)))
}

export function randomStat(random: Chance, cls: StatRange): StatInstance {
    const { max, min } = cls
    const value = random.integer({ max, min })
    return { cls, value }
}
export function randomAffix(random: Chance, cls: AffixClass): AffixInstance {
    const stats = cls.stats.map(s => randomStat(random, s))
    return { cls, stats }
}
export function pickAffix(random: Chance, weights: readonly AffixWeightEntry[]): AffixClass {
    return random.weighted(weights.map(w => w.affix), weights.map(w => w.weight))
}