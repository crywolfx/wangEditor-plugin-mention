import type { IDomEditor } from '@wangeditor/editor';
import { DomEditor, SlateEditor, SlateRange, SlateTransforms } from '@wangeditor/editor';
import type { IExtendConfig, SearchItem } from './interface';
import type { BaseRange } from 'slate';
import type { MentionElement } from './custom-types';
import { mount, unmount } from './template';

class Mention {
  private editor?: IDomEditor;
  private _mentionTarget: BaseRange | null = null;
  private MENTION_CLASS_NAME = 'rich-text__mentions-list';
  private preSelectedUser: SearchItem | null = null;
  mentionEl: HTMLDivElement | null = null;
  searchList: SearchItem[] = [];

  get mentionTarget() {
    return this._mentionTarget;
  }

  set mentionTarget(val: BaseRange | null) {
    this._mentionTarget = val;
    !val && this.destoryMention();
  }

  getMentionConfig() {
    if (!this.editor) return;
    const { EXTEND_CONF } = this.editor.getConfig();
    const { mentionConfig } = EXTEND_CONF as IExtendConfig;
    return mentionConfig;
  }

  renderMentionEl() {
    setTimeout(() => {
      if (!this.mentionTarget) return;
      if (!this.editor) return;
      const container = this.editor.getEditableContainer() as HTMLDivElement;
      const domRange = DomEditor.toDOMRange(this.editor, this.mentionTarget);
      if (domRange == null) return;
      if (!this.mentionEl) {
        container.style.position = 'relative';
        this.mentionEl = document.createElement('div');
        this.mentionEl.className = this.MENTION_CLASS_NAME;
        container.appendChild(this.mentionEl);
      }
      const rect = domRange.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const absoluteTop = rect.top - containerRect.top;
      const absoluteLeft = rect.left - containerRect.left;
      this.mentionEl.style.position = 'absolute';
      this.mentionEl.style.top = absoluteTop + rect.height + 'px';
      this.mentionEl.style.left = absoluteLeft + 'px';
      this.renderMentionHtml();
    });
  }

  renderMentionHtml() {
    if (!this.mentionEl || this.searchList.length <= 0 || !this.editor) return;
    const mentionConfig = this.getMentionConfig();
    const container = this.editor.getEditableContainer() as HTMLElement;
    mount(this.mentionEl, {
      source: this.searchList,
      container: container,
      editor: this.editor,
      renderItem: mentionConfig?.renderItem,
      onSelect: (user) => {
        if (this.editor && this.mentionTarget) {
          this.editor && SlateTransforms.select(this.editor, this.mentionTarget);
          this.insertMention(user);
          this.mentionTarget = null;
        }
      },
      onPreSelect: (user) => {
        this.preSelectedUser = user;
      },
      onCancel: () => {
        this.mentionTarget = null;
      },
    });
  }

  destoryMention() {
    setTimeout(() => {
      if (!this.editor || !this.mentionEl) return;
      const container = this.editor.getEditableContainer() as HTMLDivElement;
      unmount(this.mentionEl);
      container.removeChild(this.mentionEl);
      this.mentionEl = null;
      this.searchList = [];
      this.preSelectedUser = null;
    });
  }

  insertMention(character: SearchItem) {
    if (!this.editor) return;
    const mention: MentionElement = {
      type: 'mention',
      children: [{ text: '' }],
      value: character.value,
      label: character.label,
      info: character,
    };

    this.editor.insertNode(mention);
    SlateTransforms.move(this.editor);
  }

  onChange(value: string) {
    const { onChange } = this.getMentionConfig() || {};
    if (!onChange || !this.editor) return;
    onChange(value, (searchList: SearchItem[]) => {
      this.searchList = searchList;
      if (searchList.length) {
        this.renderMentionEl();
      } else {
        this.destoryMention();
      }
    });
  }

  withMention() {
    return <T extends IDomEditor>(editor: T) => {
      const { onChange, isInline, isVoid } = editor;
      const newEditor = editor;
      this.editor = newEditor;

      newEditor.onChange = () => {
        onChange();
        // 有预选失去焦点时恢复选取
        if (!newEditor.isFocused() && this.preSelectedUser) {
          newEditor.restoreSelection();
        }
        const { selection } = newEditor;
        if (selection && SlateRange.isCollapsed(selection)) {
          const [start] = SlateRange.edges(selection);
          const wordBefore = SlateEditor.before(newEditor, start, { unit: 'word' });
          const before = wordBefore && SlateEditor.before(newEditor, wordBefore);
          const beforeRange = before && SlateEditor.range(newEditor, before, start);
          const beforeText = beforeRange && SlateEditor.string(newEditor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@([A-Za-z0-9\'\"\u4e00-\u9fa5]*)$/);
          const after = SlateEditor.after(newEditor, start);
          const afterRange = SlateEditor.range(newEditor, start, after);
          const afterText = SlateEditor.string(newEditor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            this.mentionTarget = beforeRange;
            this.onChange(beforeMatch[1]);
            return;
          }
        }
        this.mentionTarget = null;
      };

      newEditor.isInline = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'mention') {
          return true;
        }

        return isInline(elem);
      };

      newEditor.isVoid = (elem) => {
        const type = DomEditor.getNodeType(elem);
        if (type === 'mention') {
          return true;
        }

        return isVoid(elem);
      };
      return newEditor;
    };
  }
}

const mention = new Mention();
export default mention.withMention();
