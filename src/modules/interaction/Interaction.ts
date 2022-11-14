import { Editor } from "../../main";
import { InteractiveEvents } from "./InteractiveEvents";

/**
 * 负责处理用户与编辑器的交互
 */
export class Interaction {
  private editor: Editor;
  constructor(editor: Editor) {
    this.editor = editor;

    new InteractiveEvents(editor);
  }
}
