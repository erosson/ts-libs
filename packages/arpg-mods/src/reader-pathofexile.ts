import { z } from "zod"
import fs from 'fs/promises'
import path from "path"
import * as A2 from "./affix"
import * as MU from './util/map'
import { zip } from "./util/array"

export const ModFamilyId = z.string().brand('poe:ModFamilyId')
export type ModFamilyId = z.infer<typeof ModFamilyId>
export const ModTypeName = z.string().brand('poe:ModTypeName')
export type ModTypeName = z.infer<typeof ModTypeName>
export const StatId = z.string().brand('poe:StatId')
export type StatId = z.infer<typeof StatId>
export const TagId = z.string().brand('poe:TagId')
export type TagId = z.infer<typeof TagId>
export const ModId = z.string().brand('poe:ModId')
export type ModId = z.infer<typeof ModId>

export const ModFamily = z.object({
    _index: z.number(),
    Id: ModFamilyId,
})
export type ModFamily = z.infer<typeof ModFamily>

export const ModType = z.object({
    _index: z.number(),
    Name: ModTypeName,
})
export type ModType = z.infer<typeof ModType>

export const Stat = z.object({
    _index: z.number(),
    Id: StatId,
    Text: z.string(),
})
export type Stat = z.infer<typeof Stat>

export const Tag = z.object({
    _index: z.number(),
    Id: TagId,
})
export type Tag = z.infer<typeof Tag>

export const Mod = z.object({
    _index: z.number(),
    Id: ModId,
    ModTypeKey: z.number(),
    Level: z.number(),
    MaxLevel: z.number(),
    Name: z.string(),
    Families: z.array(z.number()),
    StatsKey1: z.number().nullable(),
    StatsKey2: z.number().nullable(),
    StatsKey3: z.number().nullable(),
    StatsKey4: z.number().nullable(),
    StatsKey5: z.number().nullable(),
    StatsKey6: z.number().nullable(),
    Stat1Min: z.number().nullable(),
    Stat1Max: z.number().nullable(),
    Stat2Min: z.number().nullable(),
    Stat2Max: z.number().nullable(),
    Stat3Min: z.number().nullable(),
    Stat3Max: z.number().nullable(),
    Stat4Min: z.number().nullable(),
    Stat4Max: z.number().nullable(),
    Stat5Min: z.number().nullable(),
    Stat5Max: z.number().nullable(),
    Stat6Min: z.number().nullable(),
    Stat6Max: z.number().nullable(),
    SpawnWeight_TagsKeys: z.array(z.number()),
    SpawnWeight_Values: z.array(z.number()),
})
export type Mod = z.infer<typeof Mod>

export const Poedat = z.object({
    ModFamily: z.array(ModFamily),
    Mods: z.array(Mod),
    ModType: z.array(ModType),
    Stats: z.array(Stat),
    Tags: z.array(Tag),
})
export type Poedat = z.infer<typeof Poedat>

export async function readFiles(dir: string): Promise<Poedat> {
    const names = Object.keys(Poedat.shape)
    const sources = await Promise.all(names.map(src => fs.readFile(path.join(dir, `${src}.json`)).then(buf => [src, JSON.parse(buf.toString())])))
    return Poedat.parse(Object.fromEntries(sources))
}

export function toArpgMods(dat: Poedat): readonly A2.AffixClass[] {
    const statsByIndex = MU.keyBy(dat.Stats, s => s._index)
    const tagsByIndex = MU.keyBy(dat.Tags, s => s._index)
    const familyByIndex = MU.keyBy(dat.ModFamily, s => s._index)
    return dat.Mods.map(mod => {
        const mstats = [
            { statId: mod.StatsKey1, min: mod.Stat1Min, max: mod.Stat1Max },
            { statId: mod.StatsKey2, min: mod.Stat2Min, max: mod.Stat2Max },
            { statId: mod.StatsKey3, min: mod.Stat3Min, max: mod.Stat3Max },
            { statId: mod.StatsKey4, min: mod.Stat4Min, max: mod.Stat4Max },
            { statId: mod.StatsKey5, min: mod.Stat5Min, max: mod.Stat5Max },
            { statId: mod.StatsKey6, min: mod.Stat6Min, max: mod.Stat6Max },
        ]
        const stats: A2.StatRange[] = mstats
            .map(s => {
                if (s.statId == null) return s
                const id = statsByIndex.get(s.statId)?.Id
                if (id == null) return s
                return { ...s, statId: A2.StatId.parse(id) }
            })
            .filter((s): s is A2.StatRange => s.statId != null && s.min != null && s.max != null)

        const weight: A2.AffixWeight[] = zip(mod.SpawnWeight_TagsKeys.map(val => {
            const id = tagsByIndex.get(val)?.Id ?? null
            return id ? A2.AffixSubject.parse(id) : null
        }), mod.SpawnWeight_Values)
            .map(([subject, weight]) => ({ subject, weight }))
            .filter((w): w is A2.AffixWeight => w.subject != null && w.weight != null)

        const families = mod.Families.map(f => A2.AffixFamily.parse(familyByIndex.get(f)?.Id))
        return {
            affixId: A2.AffixId.parse(mod.Id),
            families,
            level: mod.Level,
            maxLevel: mod.MaxLevel,
            stats,
            weight,
        }
    })
}