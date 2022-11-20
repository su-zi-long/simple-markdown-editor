import { NodeType } from "../../enum/nodeType";
import { INode } from "../../interface/INode";

export function generateTextNodes(texts: string) {
  const nodes: INode[] = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    nodes.push({
      index: 0,
      type: NodeType.Text,
      text,
    });
  }
  return nodes;
}

export function generateLineFeedNode(): INode {
  return {
    index: 0,
    type: NodeType.LineFeed,
    metrics: {
      width: 0,
      height: 0,
    },
  };
}
