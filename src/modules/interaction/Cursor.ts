import "../../asset/css/cursor.less";
import { generateTextNode } from "../generator/generator";

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
    this.cursorAgent.addEventListener("compositionstart", () => {
      this.compositing = true;
    });
    this.cursorAgent.addEventListener("compositionend", () => {
      this.compositing = false;
    });
  }

  private createCursorContainer() {
    const cursorContainer = document.createElement("div");
    cursorContainer.classList.add("cursor-container");
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
  }

  public getIndexes() {
    if (this.indexes.length === 0) return [0];
    return this.indexes;
  }

  public showCursor() {
    const { cursorContainer } = this;
    cursorContainer.style.display = "block";
    this.getFocus();

    const rows = this.interaction.editor.render.getRows();
    const index = this.indexes[0] || 0;
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
        x += node.metrics.width;
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
    const textNodes = generateTextNode(data);
    this.interaction.insertNodesByIndexes(textNodes);
    this.moveCursor(textNodes.length);
    this.interaction.render();
  }

  public moveCursor(distance: number) {
    const { indexes } = this;
    indexes[indexes.length - 1] += distance;
  }
}
