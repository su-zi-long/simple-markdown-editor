import babel from "rollup-plugin-babel";
import typescript from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

import packageJson from "../package.json";

export default {
  input: packageJson.main, //入口文件
  output: {
    file: `./dist/${packageJson.name}.js`, //打包后的存放文件
    format: "umd", //输出格式 amd es6 iife umd cjs
    name: packageJson.name, //如果iife,umd需要指定一个全局变量
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    babel({
      exclude: "**/node_modules/**",
    }),
    postcss(),
    livereload(),
    serve({
      open: true,
      port: 8888,
      contentBase: "",
    }),
  ],
};
