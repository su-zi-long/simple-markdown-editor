import { Editor } from "../../main";

/**
 * 负责注册和处理交互事件。比如用户点击编辑器
 */
export class InteractiveEvents {
  private editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;

    this.registerEvents();
  }

  private registerEvents() {
    const { canvasContainer } = this.editor.render.elements;

    canvasContainer.addEventListener("mousedown", this.mousedown.bind(this));
  }

  private mousedown(event: MouseEvent) {
    this.editor.event.emit("mousedown", event);
  }
}
