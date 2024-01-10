import { test } from "vitest"
import * as Diablo2 from './reader-diablo2'
import * as PathOfExile from './reader-pathofexile'
import path from "path"
import { AffixClass } from "./affix-class"

/**
 * Automated test fixtures.
 */
export interface Test2 {
    readonly diablo2: readonly AffixClass[]
    readonly pathofexile: readonly AffixClass[]
}
export const test2 = test.extend<Test2>({
    diablo2: async ({ }, use) => {
        const dat = await Diablo2.readFiles(path.join(__dirname, '../data/diablo2/dist'))
        const mods = Diablo2.toArpgMods(dat)
        await use(mods)
    },
    pathofexile: async ({ }, use) => {
        const dat = await PathOfExile.readFiles(path.join(__dirname, '../data/pathofexile/tables/English'))
        const mods = PathOfExile.toArpgMods(dat)
        await use(mods)
    },
})