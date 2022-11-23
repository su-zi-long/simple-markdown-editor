import { INode } from "../../interface/INode";
import { IRenderOptions } from "../../interface/IRenderOptions";
import { IRow } from "../../interface/IRow";
import { Editor } from "../../main";
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
    const index = this.getCursorIndexByXY(
      this.editor.render.getRows(),
      event.offsetX,
      event.offsetY
    );
    if (!~index) return;
    this.cursor.setIndexes([index]);
    this.cursor.showCursor();
    this.range.clearRange();
    this.isMousedown = true;
  }

  private mouseup() {
    this.isMousedown = false;
  }

  private mousemove(event: MouseEvent) {
    if (!this.isMousedown) return;
    const index = this.getCursorIndexByXY(
      this.editor.render.getRows(),
      event.offsetX,
      event.offsetY
    );
    const cursorIndex = this.cursor.getIndex();
    if (!~index || cursorIndex === index) return;
    this.range.setIndexes([cursorIndex], [index]);
    this.renderRange();
  }

  private getRowIndexByXy(rows: IRow[], x: number, y: number): number {
    let startHeight = this.editor.render.getY();
    for (let i = 0; i < rows.length; i++) {
      const tempRow = rows[i];
      if (startHeight <= y && y <= tempRow.height + startHeight) {
        return i;
      }
      startHeight += tempRow.height;
    }

    return rows.length - 1;
  }

  private getCursorIndexByXY(rows: IRow[], x: number, y: number) {
    const row = rows[this.getRowIndexByXy(rows, x, y)];
    if (!row) return -1;
    const { nodes } = row;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const {
        metrics: { width },
        coordinate,
      } = node;
      if (coordinate.x <= x && x <= coordinate.x + width) {
        if (x < coordinate.x + width / 2) return node.index - 1;
        return node.index;
      }
    }

    return nodes[nodes.length - 1].index;
  }

  public insertNodesByIndexes(insertNodes: INode[] | INode, moveCursor = true) {
    insertNodes = Array.isArray(insertNodes) ? insertNodes : [insertNodes];
    const nodes = this.editor.render.getNodes();
    const indexes = this.cursor.getIndexes();
    const index = indexes[0];
    const result = nodes.splice(index + 1, 0, ...insertNodes);
    if (moveCursor) {
      this.cursor.moveCursor(insertNodes.length);
    }
    return result;
  }

  public replaceNodesByRange(replaceNode?: INode[], moveCursor = true) {
    if (!this.range.hasRange()) return false;
    replaceNode = replaceNode || [];
    const nodes = this.editor.render.getNodes();
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
    const nodes = this.editor.render.getNodes();
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
