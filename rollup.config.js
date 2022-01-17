import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import css from "rollup-plugin-import-css";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import babel from '@rollup/plugin-babel';

const packageJson = require("./package.json");

export default [
    {
        input: "index.js",
        output: [
            {
                file: packageJson.main + '.js',
                format: "cjs",
                sourcemap: true,
            },
        ],
        external: [
            /node_modules/
        ],
        plugins: [
            resolve(),
            babel({
                babelrc: false,
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
            }),
            commonjs(),
            postcss(),
            css(),
            terser(),
        ],
    },
    {
        input: "index.web.js",
        output: [
            {
                file: packageJson.main + '.web.js',
                format: "cjs",
                sourcemap: true,
            },
        ],
        external: [
            /node_modules/
        ],
        plugins: [
            resolve(),
            babel({ 
                babelrc: false,
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
            }),
            commonjs(),
            postcss(),
            css(),
            terser(),
        ],
    },
];