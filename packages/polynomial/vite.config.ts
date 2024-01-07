// @ts-expect-error rest of the project has no node dependency
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        // https://vitejs.dev/guide/build.html#library-mode
        lib: {
            // @ts-expect-error rest of the project has no node dependency
            entry: resolve(__dirname, 'src/index.ts'),

            name: "PolyProd",
            // This module works both in the browser and in node.
            // Some cdns (like jsdelivr) require a `.js` extension, so node's `.cjs` and `.mjs` are no good.
            fileName(format, entryName) {
                return format === 'es' ? `${entryName}.esm.js` : `${entryName}.umd.js`
            },
        },
        sourcemap: true,
    },
    plugins: [dts({ exclude: 'src/**/*.test.ts' })],
})