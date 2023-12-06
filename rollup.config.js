import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import { globby } from "globby";
import alias from "@rollup/plugin-alias";
import image from "@rollup/plugin-image";

const distInputEntries = {
  index: "src/server/index.js",
  router: "src/server/components/router.js",
};

export default [
  {
    input: (await globby("src/client/**/*.js")).reduce(
      (acc, entryFile) => ({
        ...acc,
        [entryFile.replace(".js", "")]: entryFile,
      }),
      distInputEntries
    ),
    output: {
      dir: "dist",
      format: "esm",
      preserveModules: true,
      entryFileNames: "[name].mjs",
    },
    plugins: [
      babel({ babelHelpers: "bundled", exclude: "node_modules/**" }),
      // alias({
      //   entries: [
      //     {
      //       find: "styled-components",
      //       replacement:
      //         "../../../node_modules/styled-components/dist/styled-components.esm.js",
      //     },
      //   ],
      // }),
      peerDepsExternal(),
      nodeResolve({ resolveOnly: ["rsc-ssr-module", "styled-components"] }),
      json(),
      replace({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      image(),
    ],
  },
  {
    input: (await globby("src/client/**/*.js")).reduce(
      (acc, entryFile) => ({
        ...acc,
        [entryFile.replace(".js", "")]: entryFile,
      }),
      {}
    ),
    output: {
      dir: "public",
      format: "esm",
      entryFileNames: "[name].js",
      preserveModules: true,
    },
    plugins: [
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
      alias({
        entries: [
          {
            find: "styled-components",
            replacement: "styled-components/dist/styled-components.js",
          },
        ],
      }),
      peerDepsExternal(),
      nodeResolve(),
      commonjs(),
      json(),
      replace({
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
      image(),
    ],
    onwarn: function (warning, handler) {
      // Skip certain warnings

      // should intercept ... but doesn't in some rollup versions
      if (warning.code === "THIS_IS_UNDEFINED") {
        return;
      }

      // console.warn everything else
      handler(warning);
    },
  },
];
