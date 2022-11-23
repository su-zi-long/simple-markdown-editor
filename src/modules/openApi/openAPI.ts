import { NodeMark } from "../../enum/NodeMark";
import { NodeType } from "../../enum/nodeType";
import { Editor } from "../../main";
import { getParagraphIndex } from "../../utils/getParagraphIndex";

const HeadingList = [
  "Heading1",
  "Heading2",
  "Heading3",
  "Heading4",
  "Heading5",
  "Heading6",
];

export class OpenAPI {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  public toggleHeading(level = 1) {
    const index = this.editor.interaction.cursor.getIndex();
    if (!~index) return;
    const nodes = this.editor.render.getNodes();
    const { startIndex, endIndex } = getParagraphIndex(nodes, index);
    const has = nodes[startIndex].marks.has(NodeMark[`Heading${level}`]);
    const removeHeading = HeadingList.filter(
      (item) => item !== NodeMark[`Heading${level}`]
    );

    for (let i = startIndex; i <= endIndex; i++) {
      const node = nodes[i];
      has
        ? node.marks.delete(NodeMark[`Heading${level}`])
        : node.marks.add(NodeMark[`Heading${level}`]);
      removeHeading.forEach((item) => node.marks.delete(item));
    }
    this.editor.render.render();
  }
  public toggleBold() {
    let startIndex = -1;
    let endIndex = -1;
    if (this.editor.interaction.range.hasRange()) {
      const { startIndexes, endIndexes } =
        this.editor.interaction.range.getIndexes();
      startIndex = startIndexes[0] + 1;
      endIndex = endIndexes[0];
    } else if (this.editor.interaction.cursor.hasCursor()) {
      ({ startIndex, endIndex } = getParagraphIndex(
        this.editor.render.getNodes(),
        this.editor.interaction.cursor.getIndex()
      ));
    } else {
      return;
    }

    const nodes = this.editor.render
      .getNodes()
      .slice(startIndex, endIndex + 1)
      .filter((item) => item.type === NodeType.Text);
    const isBoldAll = nodes.every((item) => item.marks.has(NodeMark.Bold));
    nodes.forEach((item) => {
      isBoldAll
        ? item.marks.delete(NodeMark.Bold)
        : item.marks.add(NodeMark.Bold);
    });
    this.editor.render.render();
  }
  public toggleItalic() {
    let startIndex = -1;
    let endIndex = -1;
    if (this.editor.interaction.range.hasRange()) {
      const { startIndexes, endIndexes } =
        this.editor.interaction.range.getIndexes();
      startIndex = startIndexes[0] + 1;
      endIndex = endIndexes[0];
    } else if (this.editor.interaction.cursor.hasCursor()) {
      ({ startIndex, endIndex } = getParagraphIndex(
        this.editor.render.getNodes(),
        this.editor.interaction.cursor.getIndex()
      ));
    } else {
      return;
    }

    const nodes = this.editor.render
      .getNodes()
      .slice(startIndex, endIndex + 1)
      .filter((item) => item.type === NodeType.Text);
    const isItalicAll = nodes.every((item) => item.marks.has(NodeMark.Italic));
    nodes.forEach((item) => {
      isItalicAll
        ? item.marks.delete(NodeMark.Italic)
        : item.marks.add(NodeMark.Italic);
    });
    this.editor.render.render();
  }
  public toggleBlockquote() {
    const cursorNode = this.editor.interaction.cursor.getCursorNode();
    if (
      !cursorNode ||
      (cursorNode.type !== NodeType.Text &&
        cursorNode.type !== NodeType.LineFeed)
    )
      return;

    const index = this.editor.interaction.cursor.getIndex();
    const nodes = this.editor.render.getNodes();
    const { startIndex, endIndex } = getParagraphIndex(nodes, index);
    const isBlockquote = cursorNode.marks.has(NodeMark.Blockquote);

    for (let i = startIndex; i <= endIndex; i++) {
      const node = nodes[i];
      isBlockquote
        ? node.marks.delete(NodeMark.Blockquote)
        : node.marks.add(NodeMark.Blockquote);
    }
    this.editor.render.render();
    console.log("==", nodes);
  }
  public toggleOrderedList() {}
  public toggleUnorderedList() {}
  public toggleCode() {}
}
