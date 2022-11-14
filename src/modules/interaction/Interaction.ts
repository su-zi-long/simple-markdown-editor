import { Editor } from "../../main";

export class Interaction {
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
