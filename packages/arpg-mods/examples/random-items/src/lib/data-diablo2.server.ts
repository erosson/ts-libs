import { readFiles, toArpgMods } from '../../../../src/reader-diablo2'

export const dat = await readFiles('../../data/diablo2/dist')
export const mods = toArpgMods(dat)