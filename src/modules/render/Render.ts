import "../../asset/css/editor.less";
import "../../asset/css/header.less";
import "../../asset/css/body.less";
import "../../asset/css/footer.less";

import { IEditorDomMap } from "../../interface/IEditorDomMap";
import { IOptions } from "../../interface/IOptions";
import { Editor } from "../../main";
import { INode } from "../../interface/INode";
import { IRenderOptions } from "../../interface/IRenderOptions";
import { isNonEmptyArray } from "../../utils/array";
import { Computer } from "./Computer";
import { IRow } from "../../interface/IRow";
import { NodeType } from "../../enum/nodeType";
import { NodeMark } from "../../enum/NodeMark";
import { HorizontalRuleNodeLineHeight } from "../../constant/config";

/**
 * 渲染类
 * 1. 负责渲染编辑器dom
 * 2. 负责渲染canvas
 */
export class Render {
  public readonly editor: Editor;
  public readonly options: IOptions;
  private ctx: CanvasRenderingContext2D;
  private rangeCtx: CanvasRenderingContext2D;
  private nodes: INode[] = [
    {
      index: 0,
      type: NodeType.Text,
      text: "",
      metrics: {
        width: 0,
        height: 0,
      },
      coordinate: {
        x: 0,
        y: 0,
      },
      marks: {},
    },
  ];
  private rows: IRow[];
  public editorDomMap: IEditorDomMap;
  private computer: Computer;

  constructor(editor: Editor) {
    this.editor = editor;
    this.options = editor.options;
    this.computer = new Computer(this);
    this.init(editor.options);
  }

  private init(options: IOptions) {
    let { el } = options;
    if (!el) throw Error();

    el = typeof el === "string" ? document.querySelector(el) : el;
    if (!el) throw Error();

    const {
      container,
      header,
      body,
      footer,
      canvasContainer,
      contentCtx,
      rangeCtx,
    } = this.createEditorDom();
    this.editorDomMap = {
      container,
      header,
      body,
      footer,
      canvasContainer,
    };
    this.ctx = contentCtx;
    this.rangeCtx = rangeCtx;
    el.appendChild(this.editorDomMap.container);
  }

  private createEditorDom() {
    const container = document.createElement("div");
    const header = this.createEditorHeader();
    const body = this.createEditorBody();
    const footer = this.createEditorFooter();
    const { canvasContainer, contentCtx, rangeCtx } = this.createCanvas();

    body.appendChild(canvasContainer);
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    container.classList.add(this.options.classPrefix);
    container.classList.add(`${this.options.classPrefix}-container`);
    return {
      container,
      header,
      body,
      footer,
      canvasContainer,
      contentCtx,
      rangeCtx,
    };
  }

  private createEditorHeader() {
    const header = document.createElement("div");
    header.classList.add(`${this.options.classPrefix}-header`);
    return header;
  }

  private createEditorBody() {
    const body = document.createElement("div");
    body.classList.add(`${this.options.classPrefix}-body`);
    return body;
  }

  private createEditorFooter() {
    const footer = document.createElement("div");
    footer.classList.add(`${this.options.classPrefix}-footer`);
    return footer;
  }

  private createCanvas() {
    const dpr = window.devicePixelRatio;
    const { width, height } = this.options;
    const canvasContainer = document.createElement("div");
    canvasContainer.style.width = `${width}px`;
    canvasContainer.classList.add(
      `${this.options.classPrefix}-canvas-container`
    );

    const contentCanvasEl = document.createElement("canvas");
    const contentCtx = contentCanvasEl.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    contentCanvasEl.classList.add("content-canvas");
    contentCanvasEl.style.cssText = `display:block;width:${width}px;height:${height}px;`;
    contentCanvasEl.width = width * dpr;
    contentCanvasEl.height = height * dpr;
    contentCtx.scale(dpr, dpr);
    canvasContainer.appendChild(contentCanvasEl);

    const rangeCanvasEl = document.createElement("canvas");
    const rangeCtx = rangeCanvasEl.getContext("2d") as CanvasRenderingContext2D;
    rangeCanvasEl.classList.add("range-canvas");
    rangeCanvasEl.style.cssText = `display:block;width:${width}px;height:${height}px;`;
    rangeCanvasEl.width = width * dpr;
    rangeCanvasEl.height = height * dpr;
    rangeCtx.scale(dpr, dpr);
    canvasContainer.appendChild(rangeCanvasEl);

    return {
      canvasContainer,
      contentCanvasEl,
      contentCtx,
      rangeCanvasEl,
      rangeCtx,
    };
  }

  public getContentWidth() {
    return (
      this.options.width - this.options.paddings[1] - this.options.paddings[3]
    );
  }

  public getX() {
    return this.options.paddings[0];
  }

  public getY() {
    return this.options.paddings[3];
  }

  public getRows() {
    return this.rows;
  }

  public getNodes() {
    return this.nodes;
  }

  private clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.options.width, this.options.height);
  }

  public render(renderOptions?: IRenderOptions) {
    const { renderRange = true } = renderOptions || {};
    this.clearCanvas(this.ctx);
    this.rows = this.computer.compute(this.nodes, this.getContentWidth());
    this.renderRows(this.rows, this.getX(), this.getY());
    this.editor.interaction.cursor.showCursor();

    if (renderRange) this.renderRange();
    console.log(this.rows);
  }

  public renderRange() {
    this.clearCanvas(this.rangeCtx);
    const { range, cursor } = this.editor.interaction;
    if (!range.hasRange()) return;
    const { rows } = this;
    const { startIndexes, endIndexes } = range.getIndexes();
    const startIndex = startIndexes[0];
    const endIndex = endIndexes[0];
    let x = this.getX();
    let y = this.getY();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.nodes.length; j++) {
        const node = row.nodes[j];
        if (node.marks[NodeMark.Blockquote] && j === 0) {
          x += this.options.blockquotePaddingLeft;
        }
        if (node.index > startIndex && node.index <= endIndex) {
          this.renderRangeRect(
            this.rangeCtx,
            x,
            y,
            node.metrics.width,
            row.height
          );
        }
        x += node?.metrics?.width || 0;
      }
      x = this.getX();
      y += row.height;
    }

    cursor.hideCursor();
    cursor.getFocus();
  }

  public renderRangeRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#AECBFA";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  private renderRect(
    ctx: CanvasRenderingContext2D,
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
      globalAlpha?: number;
      fillStyle?: string;
    }
  ) {
    const { x, y, width, height, globalAlpha = 1, fillStyle = "#000" } = params;
    ctx.save();
    ctx.globalAlpha = globalAlpha;
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  public renderBlockquoteRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.fillStyle = "#cbcbcb";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  private renderRows(rows: IRow[], x: number, y: number) {
    const initialX = x;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.nodes.length; j++) {
        const node = row.nodes[j];
        if (node.marks[NodeMark.Blockquote] && j === 0) {
          this.renderRect(this.ctx, {
            x,
            y,
            width: this.getContentWidth(),
            height: row.height,
            fillStyle: "#f8f8f8",
          });
          this.renderRect(this.ctx, {
            x,
            y,
            width: 4,
            height: row.height,
            fillStyle: "#cbcbcb",
          });
          x += this.options.blockquotePaddingLeft;
        }
        this.renderNode(node, x, y + row.rowSpacing / 2);
        x += node?.metrics?.width || 0;
      }
      x = initialX;
      y += row.height;
    }
  }

  private renderNode(node: INode, x: number, y: number) {
    node.coordinate = {
      x,
      y,
    };
    switch (node.type) {
      case NodeType.Text:
        this.renderTextNode(node, x, y);
        break;
      case NodeType.HorizontalRule:
        this.renderHorizontalRuleNode(node, x, y);
        break;
      case NodeType.Image:
        this.renderImageNode(this.ctx, node, x, y);
        break;
      case NodeType.CodeBlock:
        this.renderCodeBlockNode(this.ctx, node, x, y);
        break;
    }
  }

  private renderTextNode(node: INode, x: number, y: number) {
    const { ctx } = this;
    const { width, height, fontBoundingBoxAscent } = node.metrics;
    const color = this.computer.getNodeFontColor(node);

    if (node.marks[NodeMark.Code] === true) {
      this.renderRect(ctx, {
        x,
        y: y - 1,
        width,
        height: height + 2,
        fillStyle: "#dddddd",
      });
    }
    if (node.marks[NodeMark.Link] !== undefined) {
      this.renderLine({
        ctx,
        startX: x,
        startY: y + height,
        endX: x + width,
        endY: y + height,
        color,
      });
    }

    ctx.save();
    ctx.font = this.computer.getNodeFont(node);
    ctx.fillStyle = color;
    ctx.fillText(node.text, x, y + fontBoundingBoxAscent);
    ctx.restore();
  }

  private renderImageNode(
    ctx: CanvasRenderingContext2D,
    node: INode,
    x: number,
    y: number
  ) {
    const img = new Image();
    img.src = node.text;
    img.onload = () => {
      ctx.drawImage(img, x, y, node.metrics.width, node.metrics.height);
    };
  }

  private renderCodeBlockNode(
    ctx: CanvasRenderingContext2D,
    node: INode,
    x: number,
    y: number
  ) {
    const paddings = this.options.codeBlockPaddings;
    this.renderRect(ctx, {
      x,
      y,
      width: node.metrics.width,
      height: node.metrics.height,
      fillStyle: "#f8f8f8",
    });
    this.renderRows(node.rows, x + paddings[3], y + paddings[0]);
  }

  private renderLine(params: {
    ctx: CanvasRenderingContext2D;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    lineWidth?: number;
    color?: string;
  }) {
    const {
      ctx,
      startX,
      startY,
      endX,
      endY,
      lineWidth = 1,
      color = "#000",
    } = params;
    ctx.save();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }

  private renderHorizontalRuleNode(node: INode, x: number, y: number) {
    const { ctx } = this;
    const { width, height } = node.metrics;
    this.renderRect(ctx, {
      x,
      y: y + height / 2 - HorizontalRuleNodeLineHeight / 2,
      width,
      height: HorizontalRuleNodeLineHeight,
    });
  }
}
