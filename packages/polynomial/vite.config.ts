import { resolve } from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        // https://vitejs.dev/guide/build.html#library-mode
        lib: {
            entry: resolve(__dirname, 'src/polynomial.ts'),
            name: "Poly",
            // This module works both in the browser and in node.
            // Some cdns (like jsdelivr) require a `.js` extension, so node's `.cjs` and `.mjs` are no good.
            fileName(format, entryName) {
                return format === 'es' ? `${entryName}.esm.js` : `${entryName}.umd.js`
            },
        },
        sourcemap: true,
        rollupOptions: {
            // allow named exports and a default export without warning me over it.
            // default export is for common usage, named exports are advanced
            output: { exports: "named" }
        }
    },
    plugins: [dts()],
})