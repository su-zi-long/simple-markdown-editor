import { NodeMark } from "../enum/NodeMark";
import { NodeType } from "../enum/nodeType";
export interface IMetrics {
  width: number;
  height: number;
  fontBoundingBoxAscent?: number;
  fontBoundingBoxDescent?: number;
}

export interface IMarks {
  [key: string]: any;
}

export interface INode {
  index: number;
  type: NodeType;
  nodes?: INode[];
  text?: string; // 元素的文本
  metrics: IMetrics;
  coordinate: { x: number; y: number };
  marks: IMarks;
}
