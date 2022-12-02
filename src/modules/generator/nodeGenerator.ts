import { NodeMark } from "../../enum/NodeMark";
import { NodeType } from "../../enum/nodeType";
import { IMarks, INode } from "../../interface/INode";

export function generateTextNodes(texts: string, marks: IMarks = {}) {
  const nodes: INode[] = [];
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    let node;
    if (~text.indexOf("\n")) {
      node = generateLineFeedNode();
    } else {
      node = {
        index: 0,
        type: NodeType.Text,
        text,
        metrics: {
          width: 0,
          height: 0,
        },
        coordinate: {
          x: 0,
          y: 0,
        },
        marks,
      };
    }
    nodes.push(node);
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
    coordinate: {
      x: 0,
      y: 0,
    },
    marks: {},
  };
}

export function generateHorizontalRuleNode(): INode {
  return {
    index: 0,
    type: NodeType.HorizontalRule,
    metrics: {
      width: 0,
      height: 0,
    },
    coordinate: {
      x: 0,
      y: 0,
    },
    marks: {},
  };
}

export function generateImageNode(
  imageBase64: string,
  width: number,
  height: number
): INode {
  return {
    index: 0,
    type: NodeType.Image,
    text: imageBase64,
    metrics: {
      width,
      height,
      imageOriginalWidth: width,
      imageOriginalHeight: height,
    },
    coordinate: {
      x: 0,
      y: 0,
    },
    marks: {},
  };
}

export function generateCodeBlockNode(texts: string): INode {
  return {
    index: 0,
    type: NodeType.CodeBlock,
    metrics: {
      width: 0,
      height: 0,
    },
    coordinate: {
      x: 0,
      y: 0,
    },
    marks: {},
    nodes: generateTextNodes(texts),
  };
}
