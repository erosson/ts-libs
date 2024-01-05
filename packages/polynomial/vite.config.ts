import { resolve } from "path";
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        // https://vitejs.dev/guide/build.html#library-mode
        lib: {
            entry: resolve(__dirname, 'src/polynomial.ts'),
            name: "Poly",
        },
        sourcemap: true,
        rollupOptions: {
            // allow named exports and a default export without warning me over it.
            // default export is for common usage, named exports are advanced
            output: { exports: "named" }
        }
    },
    plugins: [dts({ rollupTypes: true })],
})