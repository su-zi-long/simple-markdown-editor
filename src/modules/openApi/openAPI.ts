import { Editor } from "../../main";

export class OpenAPI {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public setHeading(level = 1) {
    console.log(level);
  }
  public setBold() {}
  public setItalic() {}
  public setBlockquote() {}
  public setOrderedList() {}
  public setUnorderedList() {}
  public setCode() {}
}
