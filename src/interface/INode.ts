import { IMetrics } from "./IMetrics";

export interface INode {
  index: number;
  type:
    | "text"
    | "heading1"
    | "heading2"
    | "heading3"
    | "heading4"
    | "heading5"
    | "heading6";
  nodes?: INode[];
  text?: string; // 元素的文本
  metrics?: IMetrics;
}
