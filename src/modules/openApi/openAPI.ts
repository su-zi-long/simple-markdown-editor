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
    const has = !!nodes[startIndex].marks[NodeMark.Heading];

    for (let i = startIndex; i <= endIndex; i++) {
      const node = nodes[i];
      if (has && +node.marks[NodeMark.HeadingLevel] === +level) {
        delete node.marks[NodeMark.Heading];
        delete node.marks[NodeMark.HeadingLevel];
      } else {
        node.marks[NodeMark.Heading] = true;
        node.marks[NodeMark.HeadingLevel] = level;
      }
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
    const isBoldAll = nodes.every((item) => item.marks[NodeMark.Bold]);
    nodes.forEach((item) => {
      if (isBoldAll) {
        delete item.marks[NodeMark.Bold];
      } else {
        item.marks[NodeMark.Bold] = true;
      }
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
    const isItalicAll = nodes.every((item) => item.marks[NodeMark.Italic]);
    nodes.forEach((item) => {
      if (isItalicAll) {
        delete item.marks[NodeMark.Italic];
      } else {
        item.marks[NodeMark.Italic] = true;
      }
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
    const isBlockquote = !!cursorNode.marks[NodeMark.Blockquote];

    for (let i = startIndex; i <= endIndex; i++) {
      const node = nodes[i];
      if (isBlockquote) {
        delete node.marks[NodeMark.Blockquote];
      } else {
        node.marks[NodeMark.Blockquote] = true;
      }
    }
    this.editor.render.render();
  }

  public toggleOrderedList() {}

  public toggleUnorderedList() {}

  public toggleCode() {}

  public insertHorizontalRule() {
    const { interaction } = this.editor;
    const { range } = interaction;
    if (range.hasRange()) {
      interaction.replaceNodesByRange();
    }
  }
}
