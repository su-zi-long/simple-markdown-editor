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

  public compute(nodes: INode[]) {
    const rows: IRow[] = [
      {
        nodes: [],
        height: 0,
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

      if (width > remainingWidth) isLineFeed = true;

      if (isLineFeed) {
        rows.push({
          nodes: [node],
          height,
        });
        remainingWidth = contentWidth - width;
      } else {
        const lastRow = rows[rows.length - 1];
        lastRow.nodes.push(node);
        remainingWidth -= width;
        if (height > lastRow.height) lastRow.height = height;
      }
    }

    return rows;
  }

  public getNodeFont(node: INode) {
    const { defaultFontSize, defaultFontFamily } = this.render.options
    const font = `${defaultFontSize}px ${defaultFontFamily}`;
    return font
  }

  public getNodeMetrics(node: INode) {
    const { ctx } = this;
    const { defaultFontSize } = this.render.editor.options;
    ctx.save();
    ctx.font = this.getNodeFont(node);
    const textMetrics = ctx.measureText(node.text || '');
    ctx.restore();
    return {
      width: textMetrics.width,
      height: textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent,
      fontBoundingBoxAscent: textMetrics.fontBoundingBoxAscent,
      fontBoundingBoxDescent: textMetrics.fontBoundingBoxDescent,
    };
  }
}
