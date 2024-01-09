import { readFiles, toArpgMods } from '../../../../src/reader-poe'
import path from 'path'

export const dat = await readFiles('../../data/pathofexile/tables/English')
export const mods = toArpgMods(dat)