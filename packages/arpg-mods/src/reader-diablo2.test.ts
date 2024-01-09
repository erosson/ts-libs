import { expect, test } from "vitest";
import { readFiles, toArpgMods } from "./reader-diablo2";
import path from "path";

test('read', async () => {
    const dat = await readFiles(path.join(__dirname, '../data/diablo2/dist'))
    const mods = toArpgMods(dat)
    expect(mods.length).toBeGreaterThan(1000)
})