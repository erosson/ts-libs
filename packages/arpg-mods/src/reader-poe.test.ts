import { expect, test } from "vitest";
import { readFiles, toArpgMods } from "./reader-poe";
import path from "path";

test('read', async () => {
    const dat = await readFiles(path.join(__dirname, '../data/pathofexile/tables/English'))
    const mods = toArpgMods(dat)
    expect(mods.length).toBeGreaterThan(30000)
})