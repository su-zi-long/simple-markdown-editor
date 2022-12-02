export interface IOptions {
  el?: Element | string;
  classPrefix?: string;
  width?: number;
  height?: number;
  paddings?: number[];
  rowSpacing?: number;
  textSpacing?: number;
  defaultFontSize?: number;
  defaultFontFamily?: string;
  blockquotePaddingLeft?: number;
  blockquoteMargin?: number;
  codeBlockPaddings?: [number, number, number, number];
}
