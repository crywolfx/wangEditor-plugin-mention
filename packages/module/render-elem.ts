import type { VNode } from 'snabbdom';
import { h } from 'snabbdom';
import type { SlateElement } from '@wangeditor/editor';
import type { MentionElement } from './custom-types';

function renderMention(elem: SlateElement): VNode {
  const { value = '', label } = elem as MentionElement;

  // 构建 vnode
  const vnode = h(
    'span',
    {
      props: {
        contentEditable: false, // 不可编辑
      },
      style: {
        marginLeft: '3px',
        marginRight: '3px',
        backgroundColor: 'var(--w-e-textarea-slight-bg-color)',
        borderRadius: '3px',
        padding: '0 3px',
      },
      dataset: {
        wEType: 'mention',
        value,
        label,
      },
    },
    `@${label}`, 
  );

  return vnode;
}

const conf = {
  type: 'mention', 
  renderElem: renderMention,
};

export default conf;
