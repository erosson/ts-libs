import { expect } from "vitest";
import { test2 } from "./test2";

test2('read', ({ diablo2: mods }) => {
    expect(mods.length).toBeGreaterThan(1000)
})