import { NodeMark } from "../enum/NodeMark";
import { NodeType } from "../enum/nodeType";
import { IRow } from "./IRow";
export interface IMetrics {
  width: number;
  height: number;
  fontBoundingBoxAscent?: number;
  fontBoundingBoxDescent?: number;
  imageOriginalWidth?: number;
  imageOriginalHeight?: number;
}

export interface IMarks {
  [key: string]: any;
}

export interface INode {
  index: number;
  type: NodeType;
  nodes?: INode[];
  rows?: IRow[];
  text?: string;
  metrics: IMetrics;
  coordinate: { x: number; y: number };
  marks: IMarks;
}
