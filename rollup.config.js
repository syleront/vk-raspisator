import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import minify from "rollup-plugin-minify-es";

import html from "./rollup-plugins/html-plugin/index";
import css from "./rollup-plugins/css-plugin/index";

export default {
  input: "src/index.js",
  plugins: [
    resolve(),
    json(),
    html(),
    css(),
    /* minify() */
  ],
  output: [
    {
      strict: false,
      dir: "build",
      format: "iife",
      exports: "named"
    }
  ]
};