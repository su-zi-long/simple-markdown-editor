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
    const indexes = this.getCursorIndexseByXY(
      this.editor.render.getRows(),
      event.offsetX,
      event.offsetY
    );
    this.cursor.setIndexes(indexes || [0]);
    this.cursor.showCursor();
  }

  private getCursorIndexseByXY(rows: IRow[], x: number, y: number) {
    const indexes = [];
    let row;
    let startHeight = this.editor.render.getY();
    for (let i = 0; i < rows.length; i++) {
      const tempRow = rows[i];
      if (startHeight <= y && y <= tempRow.height + startHeight) {
        row = tempRow;
        break;
      }
      startHeight += tempRow.height;
    }

    if (!row) {
      return null;
    }

    let startWidth = this.editor.render.getX();
    for (let i = 0; i < row.nodes.length; i++) {
      const tempNode = row.nodes[i];
      const { width: tempWidth } = tempNode.metrics;
      if (startWidth <= x && x <= tempWidth + startWidth) {
        indexes.push(tempNode.index);
        break;
      }
      startWidth += tempWidth;
    }

    return indexes;
  }

  public insertNodesByIndexes(insertNodes: INode[]) {
    const nodes = this.editor.render.getNodes();
    const indexes = this.cursor.getIndexes();
    const index = indexes[0];
    nodes.splice(index, 0, ...insertNodes);
  }

  public render() {
    this.editor.render.render();
  }
}
