import { NodeMark } from "../../enum/NodeMark";
import { NodeType } from "../../enum/nodeType";
import { INode } from "../../interface/INode";
import { IRow } from "../../interface/IRow";
import { Render } from "./Render";

export class Computer {
  private render: Render;
  private ctx: CanvasRenderingContext2D;
  constructor(render: Render) {
    this.render = render;
    this.ctx = document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D;
  }

  private getRowSpacing(node: INode) {
    let rowSpacing = this.render.options.rowSpacing;

    if (node.marks.has(NodeMark.Blockquote)) rowSpacing += 10;

    if (node.marks.has(NodeMark.Heading1)) {
      rowSpacing *= 3;
    } else if (node.marks.has(NodeMark.Heading2)) {
      rowSpacing *= 2.5;
    } else if (node.marks.has(NodeMark.Heading3)) {
      rowSpacing *= 2;
    } else if (node.marks.has(NodeMark.Heading4)) {
      rowSpacing *= 1.5;
    } else if (node.marks.has(NodeMark.Heading5)) {
      rowSpacing *= 1.25;
    } else if (node.marks.has(NodeMark.Heading6)) {
      rowSpacing *= 1;
    }
    return rowSpacing;
  }

  public compute(nodes: INode[]) {
    const rows: IRow[] = [
      {
        nodes: [],
        height: 0,
        rowSpacing: 0,
      },
    ];
    const { render } = this;
    const { options } = render;
    const contentWidth = render.getContentWidth();
    let remainingWidth = contentWidth;
    let x = options.paddings[3];
    let y = options.paddings[0];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const { marks } = node;
      const lastRow = rows[rows.length - 1];
      node.index = i;
      let width = 0;
      let height = 0;
      let isLineFeed = false;

      switch (node.type) {
        case NodeType.Text: {
          node.metrics = this.getNodeMetrics(node);
          ({ width, height } = node.metrics);
          break;
        }
        case NodeType.LineFeed: {
          node.metrics = this.getNodeMetrics(node);
          ({ width, height } = node.metrics);
          isLineFeed = true;
          break;
        }
        default:
          break;
      }

      if (marks.has(NodeMark.Blockquote) && lastRow.nodes.length <= 1) {
        const blockquotePaddingLeft = this.render.options.blockquotePaddingLeft;
        x += blockquotePaddingLeft;
        remainingWidth -= blockquotePaddingLeft;
      }

      if (width > remainingWidth) isLineFeed = true;

      if (isLineFeed || i === nodes.length - 1) {
        const rowSpacing = this.getRowSpacing(nodes[i - 1] || nodes[i]);
        lastRow.height += rowSpacing;
        lastRow.rowSpacing = rowSpacing;
      }

      if (isLineFeed) {
        rows.push({
          nodes: [node],
          height,
          rowSpacing: 0,
        });
        remainingWidth = contentWidth - width;
      } else {
        lastRow.nodes.push(node);
        remainingWidth -= width;
        if (height > lastRow.height) lastRow.height = height;
      }
    }

    return rows;
  }

  public getNodeFont(node: INode) {
    const { defaultFontSize, defaultFontFamily } = this.render.options;
    const { marks } = node;
    let fontSize = defaultFontSize;
    let isBold = false;
    let isItalic = false;

    if (marks.has(NodeMark.Heading1)) {
      fontSize = defaultFontSize * 2;
      isBold = true;
    } else if (marks.has(NodeMark.Heading2)) {
      fontSize = defaultFontSize * 1.5;
      isBold = true;
    } else if (marks.has(NodeMark.Heading3)) {
      fontSize = defaultFontSize * 1.25;
      isBold = true;
    } else if (marks.has(NodeMark.Heading4)) {
      fontSize = defaultFontSize * 1.1;
      isBold = true;
    } else if (marks.has(NodeMark.Heading5)) {
      fontSize = defaultFontSize;
      isBold = true;
    } else if (marks.has(NodeMark.Heading6)) {
      fontSize = defaultFontSize * 0.85;
      isBold = true;
    }

    if (marks.has(NodeMark.Bold)) isBold = true;
    if (marks.has(NodeMark.Italic)) isItalic = true;

    let font = `${isItalic ? "italic " : ""}${
      isBold ? "bold " : ""
    }${fontSize}px ${defaultFontFamily}`;
    return font;
  }

  public getNodeMetrics(node: INode) {
    const { ctx } = this;
    const { defaultFontSize } = this.render.editor.options;
    ctx.save();
    ctx.font = this.getNodeFont(node);
    const textMetrics = ctx.measureText(node.text || "");
    ctx.restore();
    return {
      width: textMetrics.width + this.render.options.textSpacing,
      height:
        textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent,
      fontBoundingBoxAscent: textMetrics.fontBoundingBoxAscent,
      fontBoundingBoxDescent: textMetrics.fontBoundingBoxDescent,
    };
  }
}
