type EmptyText = {
  text: '';
};
export type MentionElement = {
  type: 'mention';
  value: string;
  info: any;
  label: string;
  children: EmptyText[]; // void 元素必须有一个空 text
};
