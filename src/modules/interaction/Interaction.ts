import { NodeMark } from "../../enum/NodeMark";
import { INode } from "../../interface/INode";
import { IRenderOptions } from "../../interface/IRenderOptions";
import { IRow } from "../../interface/IRow";
import { Editor } from "../../main";
import { getCursorIndexesByXY } from "../../utils/calculateCursorPosition";
import { Cursor } from "./Cursor";
import { Range } from "./Range";

/**
 * 负责处理用户与编辑器的交互
 */
export class Interaction {
  public readonly editor: Editor;
  public readonly cursor: Cursor;
  public readonly range: Range;
  private isMousedown = false;

  constructor(editor: Editor) {
    this.editor = editor;

    this.cursor = new Cursor(this);
    this.range = new Range(this);
    this.registerEvents();
  }

  private registerEvents() {
    const { canvasContainer } = this.editor.render.editorDomMap;

    canvasContainer.addEventListener("mousedown", this.mousedown.bind(this));
    canvasContainer.addEventListener("mouseup", this.mouseup.bind(this));
    canvasContainer.addEventListener("mousemove", this.mousemove.bind(this));
    canvasContainer.addEventListener("mouseleave", () => {
      this.isMousedown = false;
    });
  }

  private mousedown(event: MouseEvent) {
    this.editor.event.emit("mousedown", event);
    const indexes = getCursorIndexesByXY(
      this.editor.render.getRows(),
      event.offsetX,
      event.offsetY
    );
    this.cursor.setIndexes(indexes);
    this.cursor.showCursor();
    this.range.clearRange();
    this.isMousedown = true;

    const cursorNode = this.cursor.getCursorNode();
    if (cursorNode.marks[NodeMark.Link]) {
      window.open(cursorNode.marks[NodeMark.Link]);
    }
  }

  private mouseup() {
    this.isMousedown = false;
  }

  private mousemove(event: MouseEvent) {
    if (!this.isMousedown) return;
    const indexes = getCursorIndexesByXY(
      this.editor.render.getRows(),
      event.offsetX,
      event.offsetY
    );
    const index = indexes[0];
    const cursorIndex = this.cursor.getIndex();
    // if (!~index || cursorIndex === index) return;
    this.range.setIndexes([cursorIndex], [index]);
    this.renderRange();
  }

  private getOperableNodes() {
    let nodes = this.editor.render.getNodes();
    let indexes = this.cursor.getIndexes().slice(0, -1);
    indexes.forEach((index) => {
      const node = nodes[index];
      nodes = node.nodes;
    });
    return nodes;
  }

  public insertNodes(nodes: INode[], isRender = true) {
    const { cursor, range } = this;
    if (range.hasRange()) {
      this.replaceNodesByRange(nodes);
      range.clearRange();
      this.render();
    } else if (cursor.hasCursor()) {
      this.insertNodesByIndexes(nodes);
      this.render();
    } else {
      return;
    }
  }

  public insertNodesByIndexes(insertNodes: INode[] | INode, moveCursor = true) {
    insertNodes = Array.isArray(insertNodes) ? insertNodes : [insertNodes];
    const nodes = this.getOperableNodes();
    const index = this.cursor.getIndex();
    const result = nodes.splice(index + 1, 0, ...insertNodes);
    if (moveCursor) {
      this.cursor.moveCursor(insertNodes.length);
    }
    return result;
  }

  public replaceNodesByRange(replaceNode: INode[] = [], moveCursor = true) {
    if (!this.range.hasRange()) return false;
    const nodes = this.getOperableNodes();
    const { startIndexes, endIndexes } = this.range.getIndexes();
    const startIndex = startIndexes[0] + 1;
    const endIndex = endIndexes[0];
    const count = endIndex - startIndex + 1;
    const result = nodes.splice(startIndex, count, ...replaceNode);
    if (moveCursor) {
      this.cursor.setIndexes([startIndexes[0] + replaceNode.length]);
    }
    return result;
  }

  public deleteNodeByIndexes(moveCursor = true) {
    const nodes = this.getOperableNodes();
    const index = this.cursor.getIndex();
    if (index === 0) return false;
    const result = nodes.splice(index, 1);
    if (moveCursor) {
      this.cursor.moveCursor(-1);
    }
    return result;
  }

  public getRowByNode(node: INode) {
    const rows = this.editor.render.getRows();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.nodes.length; j++) {
        const tempNode = row.nodes[j];
        if (tempNode === node) return row;
      }
    }
  }

  public render(renderOptions?: IRenderOptions) {
    this.editor.render.render(renderOptions);
  }

  public renderRange() {
    this.editor.render.renderRange();
  }
}
