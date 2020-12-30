import json from "@rollup/plugin-json";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/AsciiMorph.ts",
  output: [
    {
      file: "build/AsciiMorph.esm.js",
      format: "esm",
    },
    {
      file: "build/AsciiMorph.umd.js",
      format: "umd",
      name: "AsciiMorph",
      plugins: [terser()],
    },
  ],
  plugins: [
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
  ],
};
