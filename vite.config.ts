import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
      client: "src/client.ts",
    },
    format: ["esm"],
    fixedExtension: false,
    dts: false,
    clean: true,
    sourcemap: true,
    treeshake: true,
    minify: false,
    deps: { resolveDepSubpath: true,
      neverBundle: ["astro"],
    },
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
  },
  staged: {
    "*.{ts,tsx,js,jsx,mjs,cjs,json,md,yml,yaml}": "vp check --fix",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
