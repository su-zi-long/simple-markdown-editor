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

/**
 * 渲染类
 * 1. 负责渲染编辑器dom
 * 2. 负责渲染canvas
 */
export class Render {
  public readonly editor: Editor;
  public readonly options: IOptions;
  private ctx: CanvasRenderingContext2D;
  private nodes: INode[] = [
    {
      index: 0,
      type: NodeType.Text,
      text: "",
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

    const { container, header, body, footer, canvasContainer, contentCtx } =
      this.createEditorDom();
    this.editorDomMap = {
      container,
      header,
      body,
      footer,
      canvasContainer,
    };
    this.ctx = contentCtx;
    el.appendChild(this.editorDomMap.container);
  }

  private createEditorDom() {
    const container = document.createElement("div");
    const header = this.createEditorHeader();
    const body = this.createEditorBody();
    const footer = this.createEditorFooter();
    const { canvasContainer, contentCtx } = this.createCanvas();

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
    const dpr = window.devicePixelRatio;
    contentCanvasEl.width = width;
    contentCanvasEl.height = height;
    contentCanvasEl.style.cssText = `display:block;width:${width}px;height:${height}px;background:#fff;box-shadow:0 1px 5px #ddd;`;
    contentCanvasEl.width = width * dpr;
    contentCanvasEl.height = height * dpr;
    contentCtx.scale(dpr, dpr);

    canvasContainer.appendChild(contentCanvasEl);
    return {
      canvasContainer,
      contentCanvasEl,
      contentCtx,
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

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
  }

  public render(renderOptions?: IRenderOptions) {
    this.clearCanvas();
    this.rows = this.computer.compute(this.nodes);
    this.renderRows(this.rows);
    this.editor.interaction.cursor.showCursor();
    console.log(this.rows);
  }

  private renderRows(rows: IRow[]) {
    let x = this.options.paddings[3];
    let y = this.options.paddings[0];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.nodes.length; j++) {
        const node = row.nodes[j];
        this.renderNode(node, x, y);
        x += node?.metrics?.width || 0;
      }
      x = this.options.paddings[3];
      y += row.height;
    }
  }

  private renderNode(node: INode, x: number, y: number) {
    switch (node.type) {
      case NodeType.Text:
        this.renderTextNode(node, x, y);
        break;
    }
  }

  private renderTextNode(node: INode, x: number, y: number) {
    const { ctx } = this;
    const { fontBoundingBoxAscent } = node.metrics;
    ctx.save();
    ctx.font = `${this.options.defaultFontSize}px`;
    ctx.fillText(node.text, x, y + fontBoundingBoxAscent);
    ctx.restore();
  }
}
