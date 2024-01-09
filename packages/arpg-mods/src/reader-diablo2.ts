import fs from 'fs/promises'
import path from "path"
import { z } from "zod"
import * as A2 from "./affix"
import { zip } from './util/array'

export const AffixId = z.string().transform(s => parseInt(s))
export type AffixId = z.infer<typeof AffixId>
export const D2Bool = z.number().transform(s => !!s).optional()
export type D2Bool = z.infer<typeof D2Bool>

export const MagicAffix = z.object({
    id: AffixId,
    Name: z.string().optional(),
    expansion: D2Bool,
    spawnable: D2Bool,
    rare: D2Bool,
    level: z.number().optional(), // required for prefix
    levelreq: z.number().optional(),
    frequency: z.number().optional(),
    mod1min: z.number().optional(),
    mod1max: z.number().optional(),
    mod2code: z.string().optional(),
    mod2min: z.number().optional(),
    mod2max: z.number().optional(),
    mod3code: z.string().optional(),
    mod3min: z.number().optional(),
    mod3max: z.number().optional(),
    itype1: z.string().optional(),
    itype2: z.string().optional(),
    itype3: z.string().optional(),
    itype4: z.string().optional(),
    itype5: z.string().optional(),
    itype6: z.string().optional(),
    itype7: z.string().optional(),
    transform: z.number().optional(),
    transformcolor: z.string().optional(),
})
export type MagicAffix = z.infer<typeof MagicAffix>

export const MagicPrefix = MagicAffix.extend({
    level: z.number(),
    group: z.number(),
    mod1code: z.string(),
    classspecific: z.string().optional(),
}).transform(a => ({ ...a, slot: 'prefix' }))
export type MagicPrefix = z.infer<typeof MagicPrefix>

export const MagicSuffix = MagicAffix.extend({
    level: z.number().optional(),
    group: z.number().optional(),
    mod1code: z.string().optional(),
    class: z.string().optional(),
    classlevelreq: z.number().optional(),
}).transform(a => ({ ...a, slot: 'suffix' }))
export type MagicSuffix = z.infer<typeof MagicSuffix>

export const D2dat = z.object({
    magicprefix: z.array(MagicPrefix),
    magicsuffix: z.array(MagicSuffix),
})
export type D2dat = z.infer<typeof D2dat>

export async function readFiles(dir: string): Promise<D2dat> {
    const names = Object.keys(D2dat.shape)
    const sources = await Promise.all(names.map(src => fs.readFile(path.join(dir, `${src}.json`)).then(buf => [src, JSON.parse(buf.toString())])))
    return D2dat.parse(Object.fromEntries(sources))
}

export function toArpgMods(dat: D2dat): readonly A2.AffixClass[] {
    function toAffixClass(mod: MagicPrefix | MagicSuffix): A2.AffixClass | null {
        const mstats = [
            { statId: mod.mod1code, min: mod.mod1min, max: mod.mod1max },
            { statId: mod.mod2code, min: mod.mod2min, max: mod.mod2max },
            { statId: mod.mod3code, min: mod.mod3min, max: mod.mod3max },
        ]
        const stats: A2.StatRange[] = mstats
            .map(s => {
                if (s.statId == null) return s
                return { ...s, statId: A2.StatId.parse(s.statId) }
            })
            .filter((s): s is A2.StatRange => s.statId != null && s.min != null && s.max != null)

        const weight: A2.AffixWeight[] = [
            mod.itype1,
            mod.itype2,
            mod.itype3,
            mod.itype4,
            mod.itype5,
            mod.itype6,
            mod.itype7,
        ]
            .map(subject => ({ subject, weight: mod.frequency }))
            .filter((w): w is A2.AffixWeight => w.subject != null && w.weight != null)

        if (!mod.level) return null
        return {
            affixId: A2.AffixId.parse(`${mod.id}`),
            level: mod.level,
            maxLevel: 0,
            families: [A2.AffixFamily.parse(`${mod.group}`)],
            stats,
            weight,
        }
    }
    const magicprefix: readonly A2.AffixClass[] = dat.magicprefix.map(toAffixClass).filter((a): a is A2.AffixClass => !!a)
    const magicsuffix: readonly A2.AffixClass[] = dat.magicsuffix.map(toAffixClass).filter((a): a is A2.AffixClass => !!a)
    return [...magicprefix, ...magicsuffix]
}