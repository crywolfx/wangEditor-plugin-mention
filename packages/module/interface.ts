import type { ReactNode } from 'react';

export type SearchItem = {
  label: string;
  value: string;
  [x: string]: any;
};

export type RenderItem = (item: SearchItem) => ReactNode;
export type MentionConfig = {
  onChange: (searchTerm: string, renderList: (searchList: SearchItem[]) => void) => void;
  renderItem?: RenderItem;
};

export type IExtendConfig = {
  mentionConfig: MentionConfig;
};
