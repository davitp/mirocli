import { defineConfig } from "tsup"

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: false,
  minify: true,
  target: "node20",
  platform: "node",
  outDir: "dist",
  splitting: false
})