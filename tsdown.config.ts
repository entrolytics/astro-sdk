import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/index.ts', client: 'src/client.ts' },
  format: ['esm'],
  fixedExtension: false,
  dts: false,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: false,
  deps: { neverBundle: ['astro'] },
});
