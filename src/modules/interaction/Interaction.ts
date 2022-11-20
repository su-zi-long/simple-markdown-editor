import { INode } from "../../interface/INode";
import { IRow } from "../../interface/IRow";
import { Editor } from "../../main";
import { Cursor } from "./Cursor";

/**
 * 负责处理用户与编辑器的交互
 */
export class Interaction {
  public readonly editor: Editor;
  public readonly cursor: Cursor;
  constructor(editor: Editor) {
    this.editor = editor;

    this.cursor = new Cursor(this);
    this.registerEvents();
  }

  private registerEvents() {
    const { canvasContainer } = this.editor.render.editorDomMap;

    canvasContainer.addEventListener("mousedown", this.mousedown.bind(this));
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

    let startWidth = this.editor.render.getX();
    for (let i = 0; i < nodes.length; i++) {
      const tempNode = nodes[i];
      const { width: tempWidth } = tempNode.metrics;
      if (startWidth <= x && x <= tempWidth + startWidth) {
        return tempNode.index;
      }
      startWidth += tempWidth;
    }

    return nodes[nodes.length - 1].index;
  }

  public insertNodesByIndexes(insertNodes: INode[] | INode) {
    insertNodes = Array.isArray(insertNodes) ? insertNodes : [insertNodes];
    const nodes = this.editor.render.getNodes();
    const indexes = this.cursor.getIndexes();
    const index = indexes[0];
    nodes.splice(index + 1, 0, ...insertNodes);
  }

  public deleteNodeByIndexes() {
    const nodes = this.editor.render.getNodes();
    const index = this.cursor.getIndex();
    if (index === 0) return false;
    return nodes.splice(index, 1);
  }

  public render() {
    this.editor.render.render();
  }
}
