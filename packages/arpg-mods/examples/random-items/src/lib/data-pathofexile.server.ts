import { readFiles, toArpgMods } from '../../../../src/reader-pathofexile'

export const dat = await readFiles('../../data/pathofexile/tables/English')
export const mods = toArpgMods(dat)