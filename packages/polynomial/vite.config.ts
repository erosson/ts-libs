import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        // https://vitejs.dev/guide/build.html#library-mode
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: "ViteLib",
        }
    }
})