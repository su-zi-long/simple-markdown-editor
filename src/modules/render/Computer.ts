import { HorizontalRuleNodeHeight } from "../../constant/config";
import { NodeMark } from "../../enum/NodeMark";
import { NodeType } from "../../enum/nodeType";
import { INode } from "../../interface/INode";
import { IRow } from "../../interface/IRow";
import { Render } from "./Render";

const scale = {
  "1": 3,
  "2": 2.5,
  "3": 2,
  "4": 1.5,
  "5": 1.25,
  "6": 1,
};

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

    if (node.marks[NodeMark.Blockquote]) rowSpacing += 10;

    if (node.marks[NodeMark.Heading]) {
      rowSpacing *= scale[node.marks[NodeMark.HeadingLevel] || 6];
    }
    return rowSpacing;
  }

  public compute(nodes: INode[], contentWidth: number) {
    const rows: IRow[] = [
      {
        nodes: [],
        height: 0,
        rowSpacing: 0,
      },
    ];
    const { render } = this;
    const { options } = render;
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
      let isBlock = false;

      switch (node.type) {
        case NodeType.LineFeed: {
          isLineFeed = true;
          break;
        }
        case NodeType.CodeBlock:
          const paddings = this.render.options.codeBlockPaddings;
          node.rows = this.compute(
            node.nodes || [],
            contentWidth - paddings[1] - paddings[3]
          );
          isBlock = true;
          break;
        case NodeType.HorizontalRule: {
          isBlock = true;
          break;
        }
        default:
          break;
      }

      node.metrics = this.getNodeMetrics(node, contentWidth);
      ({ width, height } = node.metrics);

      if (marks[NodeMark.Blockquote] && lastRow.nodes.length <= 1) {
        const blockquotePaddingLeft = this.render.options.blockquotePaddingLeft;
        x += blockquotePaddingLeft;
        remainingWidth -= blockquotePaddingLeft;
      }

      if (width > remainingWidth) isLineFeed = true;

      if (isBlock) isLineFeed = true;

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
        remainingWidth = isBlock ? 0 : contentWidth - width;
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

    if (node.marks[NodeMark.Heading]) {
      fontSize =
        defaultFontSize * scale[node.marks[NodeMark.HeadingLevel] || 6];
      isBold = true;
    }

    if (marks[NodeMark.Bold]) isBold = true;
    if (marks[NodeMark.Italic]) isItalic = true;

    let font = `${isItalic ? "italic " : ""}${
      isBold ? "bold " : ""
    }${fontSize}px ${defaultFontFamily}`;
    return font;
  }

  public getNodeFontColor(node: INode) {
    if (node.marks[NodeMark.Link] !== undefined) return "#0269c8";
    if (node.marks[NodeMark.Code] === true) return "#ff502c";
    return "#000000";
  }

  public getNodeMetrics(node: INode, contentWidth: number) {
    switch (node.type) {
      case NodeType.Text:
      case NodeType.LineFeed:
        return this.getTextNodeMetrics(node);
      case NodeType.HorizontalRule:
        return this.getHorizontalRuleNodeMetrics(node);
      case NodeType.Image:
        return this.getImageMetrics(node);
      case NodeType.CodeBlock:
        return this.getCodeBlockMetrics(node, contentWidth);
    }
  }

  public getTextNodeMetrics(node: INode) {
    const { ctx } = this;
    const { defaultFontSize } = this.render.editor.options;
    ctx.save();
    ctx.font = this.getNodeFont(node);
    const textMetrics = ctx.measureText(node.text || "");
    ctx.restore();
    return {
      width: textMetrics.width
        ? textMetrics.width + this.render.options.textSpacing
        : 0,
      height:
        textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent,
      fontBoundingBoxAscent: textMetrics.fontBoundingBoxAscent,
      fontBoundingBoxDescent: textMetrics.fontBoundingBoxDescent,
    };
  }

  public getHorizontalRuleNodeMetrics(node: INode) {
    return {
      width: this.render.getContentWidth(),
      height: HorizontalRuleNodeHeight,
    };
  }

  public getImageMetrics(node: INode) {
    const contentWidth = this.render.getContentWidth();
    const { metrics } = node;
    const { width, height } = metrics;

    if (width > contentWidth) {
      metrics.width = contentWidth;
      metrics.height = height * (1 - (width - contentWidth) / width);
    }

    return metrics;
  }

  public getCodeBlockMetrics(node: INode, contentWidth: number) {
    const paddings = this.render.options.codeBlockPaddings;
    return {
      width: contentWidth,
      height:
        node.rows.reduce((h, item) => h + item.height, 0) +
        paddings[0] +
        paddings[2],
    };
  }
}
