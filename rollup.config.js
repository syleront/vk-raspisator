import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import minify from "rollup-plugin-babel-minify";
import strip from "rollup-plugin-strip";

import configer from "./rollup-plugins/userscript-config/index";
import html from "./rollup-plugins/html-plugin/index";
import css from "./rollup-plugins/css-plugin/index";

export default {
  input: "src/index.js",
  plugins: [
    resolve(),
    json(),
    html(),
    css(),
    strip({
      functions: ["console.log"],
    }),
    minify({
      comments: false
    }),
    configer({
      path: "./src/gs.config"
    })
  ],
  output: [
    {
      strict: false,
      file: "build/index.user.js",
      format: "iife",
      exports: "named"
    }
  ]
};