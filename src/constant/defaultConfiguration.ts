import { IOptions } from "../interface/IOptions";

export const defaultConfiguration: IOptions = {
  classPrefix: "simple-markdown-editor",
  width: 794,
  height: 1123,
  // paddings: [0, 0, 0, 0],
  paddings: [100, 100, 100, 100],
  rowSpacing: 8,
  textSpacing: 1,
  defaultFontSize: 16,
  defaultFontFamily: "Arial",
  blockquotePaddingLeft: 15,
  blockquoteMargin: 10,
  codeBlockPaddings: [20, 20, 20, 20],
};
