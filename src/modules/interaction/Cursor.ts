import "../../asset/css/cursor.less";
import { KeyboardEvnet } from "../../enum/keyboardEvnet";
import {
  generateLineFeedNode,
  generateTextNodes,
} from "../generator/nodeGenerator";

import { Interaction } from "./Interaction";

export class Cursor {
  private interaction: Interaction;
  private indexes = [0];
  private cursorContainer: HTMLElement;
  private cursorAgent: HTMLInputElement;
  private compositing = false;
  constructor(interaction: Interaction) {
    this.interaction = interaction;

    this.cursorContainer = this.createCursorContainer();
    this.cursorAgent = this.createCursorAgent();
    this.cursorContainer.appendChild(this.cursorAgent);
    this.interaction.editor.render.editorDomMap.canvasContainer.appendChild(
      this.cursorContainer
    );

    this.registerEvent();
  }

  private registerEvent() {
    this.cursorAgent.addEventListener("input", (event: InputEvent) => {
      setTimeout(() => {
        this.input(event);
      });
    });
    this.cursorAgent.addEventListener("keydown", (event: KeyboardEvent) => {
      let isPreventDefault = true;
      const keys = [];
      if (event.ctrlKey) keys.push("Ctrl");
      if (event.shiftKey) keys.push("Shift");
      if (event.altKey) keys.push("Alt");
      keys.push(event.key);
      const key = keys.join("+");

      switch (key) {
        case KeyboardEvnet.Enter:
          this.enter();
          break;
        case KeyboardEvnet.Backspace:
          this.backspace();
          break;
        case KeyboardEvnet.ArrowLeft:
          this.arrowLeft();
          break;
        case KeyboardEvnet.ArrowUp:
          this.arrowUp();
          break;
        case KeyboardEvnet.ArrowRight:
          this.arrowRight();
          break;
        case KeyboardEvnet.ArrowDown:
          this.arrowDown();
          break;
        case KeyboardEvnet.Heading1:
          this.interaction.editor.openAPI.setHeading(1);
          break;
        case KeyboardEvnet.Heading2:
          this.interaction.editor.openAPI.setHeading(2);
          break;
        case KeyboardEvnet.Heading3:
          this.interaction.editor.openAPI.setHeading(3);
          break;
        case KeyboardEvnet.Heading4:
          this.interaction.editor.openAPI.setHeading(4);
          break;
        case KeyboardEvnet.Heading5:
          this.interaction.editor.openAPI.setHeading(5);
          break;
        case KeyboardEvnet.Heading6:
          this.interaction.editor.openAPI.setHeading(6);
          break;
        default:
          isPreventDefault = false;
          break;
      }

      if (isPreventDefault) event.preventDefault();
    });
    this.cursorAgent.addEventListener("compositionstart", () => {
      this.compositing = true;
    });
    this.cursorAgent.addEventListener("compositionend", () => {
      this.compositing = false;
    });
  }

  private createCursorContainer() {
    const cursorContainer = document.createElement("div");
    cursorContainer.classList.add("cursor-container", "cursor-animation");
    return cursorContainer;
  }

  private createCursorAgent() {
    const cursorAgent = document.createElement("input");
    cursorAgent.autocomplete = "off";
    cursorAgent.classList.add("agent-cursor");
    return cursorAgent;
  }

  public setIndexes(indexes: number[]) {
    this.indexes = indexes;
    console.log("当前光标位置", this.indexes);
  }

  public getIndexes() {
    return this.indexes;
  }

  public getIndex(level = 0) {
    return this.indexes[level];
  }

  public showCursor() {
    const { cursorContainer } = this;
    cursorContainer.style.display = "block";
    this.getFocus();

    const rows = this.interaction.editor.render.getRows();
    const index = this.indexes[0];
    const { render } = this.interaction.editor;
    let y = render.getY();
    let x = render.getX();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.nodes.length; j++) {
        const node = row.nodes[j];
        if (node.index === index) {
          cursorContainer.style.left = `${x + node.metrics.width}px`;
          cursorContainer.style.top = `${y}px`;
          cursorContainer.style.height = `${row.height}px`;
          return;
        }
        x += node?.metrics?.width || 0;
      }
      y += row.height;
      x = render.getX();
    }
  }

  public hideCursor() {
    this.cursorContainer.style.display = "none";
    this.loseFocus();
  }

  private getFocus() {
    setTimeout(() => {
      this.cursorAgent.focus();
      this.cursorAgent.setSelectionRange(0, 0);
    });
  }

  private loseFocus() {
    this.cursorAgent.blur();
  }

  private input(event: InputEvent) {
    const { data } = event;
    if (this.compositing || !data) return;
    const textNodes = generateTextNodes(data);
    this.interaction.insertNodesByIndexes(textNodes);
    this.moveCursor(textNodes.length);
    this.interaction.render();
  }

  public moveCursor(distance: number) {
    const { indexes } = this;
    indexes[indexes.length - 1] += distance;
  }

  private enter() {
    const lineFeedNode = generateLineFeedNode();
    this.interaction.insertNodesByIndexes(lineFeedNode);
    this.moveCursor(1);
    this.interaction.render();
  }

  private backspace() {
    const result = this.interaction.deleteNodeByIndexes();
    if (!result) return;
    this.moveCursor(-1);
    this.interaction.render();
  }

  private arrowLeft() {}
  private arrowUp() {}
  private arrowRight() {}
  private arrowDown() {}
}
