import type { DOMElement } from '../utils/dom';
import type { SlateElement } from '@wangeditor/editor';
import type { MentionElement } from './custom-types';
import { jsonParse } from '@/common/utils';

function parseHtml(elem: DOMElement): SlateElement {
  // elem HTML 结构 <span data-w-e-type="mention" data-w-e-is-void data-w-e-is-inline data-value="张三" data-info="xxx">@张三</span>

  const value = elem.getAttribute('data-value') || '';
  const rawInfo = decodeURIComponent(elem.getAttribute('data-info') || '');
  let info: any;
  try {
    info = jsonParse(rawInfo);
  } catch (ex) {
    info = rawInfo;
  }

  return {
    type: 'mention',
    value,
    info,
    children: [{ text: '' }], // void node 必须有一个空白 text
  } as MentionElement;
}

const parseHtmlConf = {
  selector: 'span[data-w-e-type="mention"]',
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
