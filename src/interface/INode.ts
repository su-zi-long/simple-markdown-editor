import { NodeType } from "../enum/nodeType";
import { IMetrics } from "./IMetrics";

export interface INode {
  index: number;
  type: NodeType;
  nodes?: INode[];
  text?: string; // 元素的文本
  metrics?: IMetrics;
}
