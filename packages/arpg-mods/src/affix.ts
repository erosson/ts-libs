import { z } from "zod";

// generally, we have three formats at play here:
// - XClass: a template, with properties every one of these things has
// - XInstance: one of the things, currently in memory
// - XPersist: one of the things, written to disk

// TODO: damage ranges - "adds 1 - 100 damage".
// this is two stats, not one. but they're displayed as a single stat!
// confirmed it's two stats, poe rolls min/max separately. you can have a high min, low max, or low min, high max. https://www.craftofexile.com/ > emulator
// but it's distinct from things like hybrid phys, or betrayal mods - two stats displayed as two stats.

export const StatId = z.string().min(1).brand('StatId')
export type StatId = z.infer<typeof StatId>;
export const StatGroupId = z.string().min(1).brand('StatGroupId')
export type StatGroupId = z.infer<typeof StatGroupId>;
export const AffixId = z.string().min(1).brand('AffixId')
export type AffixId = z.infer<typeof AffixId>;
export const AffixTag = z.string().min(1).brand('AffixTag')
export type AffixTag = z.infer<typeof AffixTag>;
export const AffixSubject = z.string().min(1).brand('AffixSubject')
export type AffixSubject = z.infer<typeof AffixSubject>;
export const AffixFamily = z.string().min(1).brand('AffixFamily')
export type AffixFamily = z.infer<typeof AffixFamily>;
export const Percent = z.number().refine(n => n >= 0 && n <= 1, "percent must be between 0 and 1")

/**
 * Stat examples:
 * 
 * - 10% increased damage
 * - 10% increased fire damage
 * - 10% increased damage while on low life
 * - 10% more damage
 * - +10 accuracy
 * - +10 min damage
 * - +15 max damage
 * 
 * stats are rendered as part of a mod, they are not displayed alone
 */
export const StatRange = z.object({
    statId: StatId,
    min: z.number(),
    max: z.number(),
})
export type StatRange = z.infer<typeof StatRange>;

/**
 * Stats that always appear together. Used for rendering and validation.
 * 
 * There are two ways we render stats:
 * - stats that aren't part of a group: rendering is keyed by `stat:<stat-id>`; renderer sees only one stat and can address it positionally or by name
 * - stats that are part of a group: rendering is keyed by `statgroup:<statgroup-id>`; renderer sees every stat and must address them by name
 * 
 * Also, validation: affixes affecting *any* grouped stat must include *all* grouped stats.
 * Can't modify flat-max-damage without also modifying flat-min-damage.
 */
export const StatGroup = z.object({
    groupId: StatGroupId,
    statId: StatId,
})

/**
 * How often does this affix appear in random rolls? When is it eligible to appear at all?
 */
export const AffixWeight = z.object({
    subject: AffixSubject,
    weight: z.number().nonnegative(),
})
export type AffixWeight = z.infer<typeof AffixWeight>;

/**
 * Groups of mods that are randomly rolled. Usually a single mod, but sometimes multiple. Examples:
 * 
 * - [10% increased damage]
 * - [10% increased fire damage]
 * - [10% increased damage while on low life]
 * - [10% more damage]
 * - [+10-15 damage]
 * - [10% increased damage], [+10 accuracy]
 * 
 * Note the last two examples - both have two stats.
 * The first is rendered as a single line, using a {@link StatGroup}. The second is rendered as two lines, no grouping.
 */
export const AffixClass = z.object({
    affixId: AffixId,
    // TODO: implement the basics before adding these
    // slot: z.enum(['prefix', 'suffix']).optional(),
    level: z.number().nonnegative(),
    // tags: z.array(AffixTag),
    families: z.array(AffixFamily),
    weight: z.array(AffixWeight),
    stats: z.array(StatRange),
})
export type AffixClass = z.infer<typeof AffixClass>;