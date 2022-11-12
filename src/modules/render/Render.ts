import "../../asset/css/header.less";
import "../../asset/css/body.less";
import "../../asset/css/footer.less";

import { IElements } from "../../interface/IElements";
import { IOptions } from "../../interface/IOptions";
import { Editor } from "../../main";

export class Render {
  private editor: Editor;
  private options: IOptions;
  public elements: IElements;
  constructor(editor: Editor) {
    this.editor = editor;
    this.options = editor.options;
    this.init(editor.options);
  }

  private init(options: IOptions) {
    let { el } = options;
    if (!el) throw Error();

    el = typeof el === "string" ? document.querySelector(el) : el;
    if (!el) throw Error();

    this.elements = this.createEditorElements();
    el.appendChild(this.elements.container);
  }
  private createEditorElements() {
    const container = document.createElement("div");
    const header = this.createEditorHeader();
    const body = this.createEditorBody();
    const footer = this.createEditorFooter();
    const { canvasContainer } = this.createCanvas();

    body.appendChild(canvasContainer);
    container.appendChild(header);
    container.appendChild(body);
    container.appendChild(footer);

    container.classList.add(`${this.options.classPrefix}-container`);
    return {
      container,
      header,
      body,
      footer,
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
}
