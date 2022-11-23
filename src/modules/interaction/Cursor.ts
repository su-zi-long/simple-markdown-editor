import "../../asset/css/cursor.less";
import { inputFollowMarks } from "../../constant/inputFollowMarks";
import { KeyboardEvnet } from "../../enum/keyboardEvnet";
import { intersection } from "../../utils/intersection";
import {
  generateLineFeedNode,
  generateTextNodes,
} from "../generator/nodeGenerator";

import { Interaction } from "./Interaction";

export class Cursor {
  private interaction: Interaction;
  private indexes = [0];
  private cursor: HTMLElement;
  private cursorAgent: HTMLInputElement;
  private compositing = false;
  private isFocus = false;
  constructor(interaction: Interaction) {
    this.interaction = interaction;

    this.cursor = this.createCursor();
    this.cursorAgent = this.createCursorAgent();
    this.interaction.editor.render.editorDomMap.canvasContainer.appendChild(
      this.cursor
    );
    this.interaction.editor.render.editorDomMap.canvasContainer.appendChild(
      this.cursorAgent
    );

    this.registerEvent();
  }

  private registerEvent() {
    this.cursorAgent.addEventListener("input", (event: InputEvent) => {
      setTimeout(() => {
        this.input(event);
      });
    });
    this.cursorAgent.addEventListener("keydown", this.keydown.bind(this));
    this.cursorAgent.addEventListener("compositionstart", () => {
      this.compositing = true;
    });
    this.cursorAgent.addEventListener("compositionend", () => {
      this.compositing = false;
    });
    this.cursorAgent.addEventListener("focus", () => {
      this.isFocus = true;
    });
    this.cursorAgent.addEventListener("blur", () => {
      this.isFocus = false;
    });
  }

  private createCursor() {
    const cursor = document.createElement("div");
    cursor.classList.add("cursor", "cursor-animation");
    return cursor;
  }

  private createCursorAgent() {
    const cursorAgent = document.createElement("input");
    cursorAgent.autocomplete = "off";
    cursorAgent.classList.add("agent-cursor");
    return cursorAgent;
  }

  private keydown(event: KeyboardEvent) {
    let isPreventDefault = true;
    const keys = [];
    if (event.ctrlKey) keys.push("CTRL");
    if (event.shiftKey) keys.push("SHIFT");
    if (event.altKey) keys.push("ALT");
    keys.push(event.key);
    const key = keys.join("+").toUpperCase();
    // console.log("key", key);

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
        this.interaction.editor.openAPI.toggleHeading(1);
        break;
      case KeyboardEvnet.Heading2:
        this.interaction.editor.openAPI.toggleHeading(2);
        break;
      case KeyboardEvnet.Heading3:
        this.interaction.editor.openAPI.toggleHeading(3);
        break;
      case KeyboardEvnet.Heading4:
        this.interaction.editor.openAPI.toggleHeading(4);
        break;
      case KeyboardEvnet.Heading5:
        this.interaction.editor.openAPI.toggleHeading(5);
        break;
      case KeyboardEvnet.Heading6:
        this.interaction.editor.openAPI.toggleHeading(6);
        break;
      case KeyboardEvnet.Bold:
        this.interaction.editor.openAPI.toggleBold();
        break;
      case KeyboardEvnet.Italic:
        this.interaction.editor.openAPI.toggleItalic();
        break;
      case KeyboardEvnet.Blockquote:
        this.interaction.editor.openAPI.toggleBlockquote();
        break;
      default:
        isPreventDefault = false;
        break;
    }

    if (isPreventDefault) event.preventDefault();
  }

  private input(event: InputEvent) {
    const { data } = event;
    if (this.compositing || !data) return;
    const textNodes = generateTextNodes(data);

    const nodes = this.interaction.editor.render.getNodes();
    const cursorNodeMarks = this.getCursorNode().marks;
    textNodes.forEach(
      (node) => (node.marks = intersection(cursorNodeMarks, inputFollowMarks))
    );
    if (this.interaction.range.hasRange()) {
      this.interaction.replaceNodesByRange(textNodes);
      this.interaction.range.clearRange();
    } else if (this.hasCursor()) {
      this.interaction.insertNodesByIndexes(textNodes);
    } else {
      return
    }
    this.interaction.render();
  }

  private enter() {
    const lineFeedNode = generateLineFeedNode();
    this.interaction.insertNodesByIndexes(lineFeedNode);
    this.interaction.render();
  }

  private backspace() {
    if (this.interaction.range.hasRange()) {
      this.interaction.replaceNodesByRange();
      this.interaction.range.resetRange();
      this.interaction.render();
    } else if (this.interaction.cursor.hasCursor()) {
      this.interaction.deleteNodeByIndexes();
      this.interaction.render();
    }
  }

  private arrowLeft() {}
  private arrowUp() {}
  private arrowRight() {}
  private arrowDown() {}

  public hasCursor() {
    return this.indexes[0] > -1;
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

  public getCursorNode() {
    return this.interaction.editor.render.getNodes()[this.getIndex()];
  }

  public showCursor() {
    const { cursor, cursorAgent } = this;
    cursor.style.display = "block";
    this.getFocus();
    const cursorNode = this.getCursorNode();
    if (!cursorNode) return;
    const {
      coordinate: { x, y },
      metrics: { width, height },
    } = cursorNode;

    cursor.style.left = `${x + width}px`;
    cursor.style.top = `${y}px`;
    cursor.style.height = `${height}px`;
    cursorAgent.style.left = `${x + width}px`;
    cursorAgent.style.top = `${y}px`;
  }

  public hideCursor() {
    this.cursor.style.display = "none";
  }

  public moveCursor(distance: number) {
    const { indexes } = this;
    indexes[indexes.length - 1] += distance;
  }

  public getFocus() {
    setTimeout(() => {
      this.cursorAgent.focus();
      this.cursorAgent.setSelectionRange(0, 0);
    });
  }

  public loseFocus() {
    this.cursorAgent.blur();
  }
}
