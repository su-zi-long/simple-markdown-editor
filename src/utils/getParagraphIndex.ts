import { NodeType } from "../enum/nodeType";
import { INode } from "../interface/INode";

export function getParagraphIndex(nodes: INode[], index: number) {
  const result = {
    startIndex: -1,
    endIndex: -1,
  };
  if (index < 0 || index >= nodes.length) return result;

  for (let i = index; i >= 0; i--) {
    const node = nodes[i];
    result.startIndex = node.index;

    if (node.type === NodeType.LineFeed) break;
  }
  for (let i = index + 1; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type == NodeType.LineFeed) break;
    result.endIndex = node.index;
  }
  if (result.startIndex > -1 && result.endIndex === -1) result.endIndex = index;
  return result;
}
