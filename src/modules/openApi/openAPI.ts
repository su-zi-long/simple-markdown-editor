import { NodeMark } from "../../enum/NodeMark";
import { NodeType } from "../../enum/nodeType";
import { Editor } from "../../main";
import { getParagraphIndex } from "../../utils/getParagraphIndex";
import {
  generateHorizontalRuleNode,
  generateImageNode,
  generateTextNodes,
} from "../generator/nodeGenerator";

import Dialog from "lu2/theme/pure/js/common/ui/Dialog";
import "lu2/theme/pure/css/common/ui.css";

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

  public insertLink() {
    const { interaction } = this.editor;
    const { cursor, range } = interaction;

    const _insertLink = (text: string, link: string) => {
      const textNodes = generateTextNodes(text, {
        [NodeMark.Link]: link,
      });
      interaction.insertNodes(textNodes);
    };

    new Dialog({
      title: "链接",
      content: `
      <div class="simple-markdown-editor-link-form">
        <div>
          <span>文本：</span><input class="ui-input text">
        </div>
        <br>
        <div>
          <span>链接：</span><input class="ui-input link" value="http://">
        </div>
      </div>
      `,
      buttons: [
        {
          value: "确定",
          events: {
            click: (event) => {
              const form = document.querySelector(
                ".simple-markdown-editor-link-form"
              );
              const text = (
                form.querySelector("input.text") as HTMLInputElement
              ).value;
              const link = (
                form.querySelector("input.link") as HTMLInputElement
              ).value;
              _insertLink(text, link);
              event.dialog.remove();
            },
          },
        },
        {
          value: "取消",
        },
      ],
    });
  }

  public insertImage() {
    const _insertImage = (base64: string, width: number, height: number) => {
      const imageNode = generateImageNode(base64, width, height);
      this.editor.interaction.insertNodes([imageNode]);
    };

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".png, .jpg, .jpeg, .webp";
    fileInput.click();
    fileInput.onchange = () => {
      const file = fileInput.files![0]!;
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        const imageEl = new Image();
        const value = fileReader.result as string;
        imageEl.src = value;
        imageEl.onload = () => {
          _insertImage(value, imageEl.width, imageEl.height);
          fileInput.value = "";
        };
      };
    };
  }

  public toggleOrderedList() {}

  public toggleUnorderedList() {}

  public toggleCode() {}

  public insertHorizontalRule() {
    const horizontalRuleNode = generateHorizontalRuleNode();
    const { interaction } = this.editor;
    const { range, cursor } = interaction;
    if (range.hasRange()) {
      interaction.replaceNodesByRange([horizontalRuleNode]);
      range.resetRange();
    } else if (cursor.hasCursor()) {
      interaction.insertNodesByIndexes(horizontalRuleNode);
    } else {
      return;
    }
    interaction.render();
  }
}
