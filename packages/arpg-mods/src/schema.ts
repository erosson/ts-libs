/**
 * A named value, used later to construct stats. Examples:
 * 
 * - 10% increased damage
 * - 10% increased fire damage
 * - 10% increased damage while on low life
 * - 10% more damage
 * - +10 damage
 * 
 * Hybrid mods (10% inc damage, +10 to accuracy) do not exist, but affixes can have multiple mods
 */
export interface StatModifier {
    // TODO: modId should probably be more complex than a string, to easily support flat/increased/more modifiers
    // could also do that with fixed prefixes, like "fire-damage:increased", "fire-damage:flat"...
    readonly modId: string
    readonly value: number
}

/**
 * Ranges of random mods, not yet rolled. Examples:
 * 
 * a) (5%-15%) increased damage
 * b) (5%-15%) increased fire damage
 * c) (+5-+15) damage
 * d) (5%-15%) increased damage, and (+5-+15) accuracy
 */
export interface AffixClass {
    readonly affixId: string
    readonly slot: "prefix" | "suffix" // | "implicit" | "enchant" // others?
    readonly level: number
    // what kind of stat is this? things like harvest roll only a particular kind of stat, like "life" or "speed"
    readonly tags: ReadonlySet<string>
    // what types of items/other things can this affix randomly appear on? what are the odds for each one?
    // ex: claw:1000, 2haxe:1000, 1haxe: 1000...
    readonly weights: readonly Weight[]
    // what other affixes is this affix grouped with? what other mods can it *not* appear with? maximum one affix per family per item.
    // example: LocalDamageAndAccuracyRating; MaximumLife...
    // this field ensures, for example, weapons can't roll both influenced and non-influenced damage%. same family, different weights/sources.
    readonly family: string
    // this is a list, to support hybrid mods like (d) in the above docs
    readonly mods: readonly ModRange[]
}
export interface Weight {
    readonly source: string
    readonly weight: number
}
/**
 * Range of a single random mod, not yet rolled. max >= min.
 */
export interface ModRange {
    readonly modId: string
    readonly min: number
    readonly max: number
}

/**
 * An affix instance, with rolled mod values. Examples:
 * 
 * - 10% increased damage
 * - 10% increased fire damage
 * - 10% increased damage, and +12 accuracy
 */
export interface Affix {
    readonly cls: AffixClass
    // roll ranges, 0-1. this is mostly used to construct mods
    readonly rolls: readonly number[]
    // this is calculated from `rolls` and `type.mods`; not persistent data
    readonly values: readonly StatModifier[]
}

export interface ItemClass {
    // roll affixes with any matching source. example: bow, 1haxe, 2haxe, UnsetRing...
    // if multiple sources match, use the first one, I guess?
    // in poe, item influence is an additional source
    readonly source: readonly string[]
    // TODO implicit stats
}
export interface Item {
    readonly cls: ItemClass
    readonly ilvl: number
    // TODO item rarity
    readonly affixes: readonly Affix[]
}