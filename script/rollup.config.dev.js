import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default {
  input: "src/main.ts", //入口文件
  output: {
    file: `./dist/simple-markdown-editor.js`, //打包后的存放文件
    format: "umd", //输出格式 amd es6 iife umd cjs
    name: "SimpleMarkdownEditor", //如果iife,umd需要指定一个全局变量
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    postcss(),
    livereload(),
    serve({
      open: true,
      port: 8888,
      contentBase: "",
    }),
  ],
};
