import { jsonStringify } from '@/common/utils';
import type { SlateElement } from '@wangeditor/editor';
import type { MentionElement } from './custom-types';

function mentionToHtml(elem: SlateElement): string {
  const { value = '', label, info = {} } = elem as MentionElement;
  const infoStr = encodeURIComponent(jsonStringify(info));

  return `<span data-w-e-type="mention" data-w-e-is-void data-w-e-is-inline data-value="${value}" data-info="${infoStr}">@${label}</span>`;
}

const conf = {
  type: 'mention',
  elemToHtml: mentionToHtml,
};

export default conf;
