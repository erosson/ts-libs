import { expect } from "vitest";
import { test2 } from "./test2";

test2('read', ({ pathofexile: mods }) => {
    expect(mods.length).toBeGreaterThan(30000)
})