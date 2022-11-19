import { INode } from "../../interface/INode";

export function generateTextNode(texts: string) {
  const nodes: INode[] = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    nodes.push({
      index: 0,
      type: "text",
      text,
    });
  }
  return nodes;
}
