import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import type { RenderItem, SearchItem } from '../interface';
import { useEffect, useRef, useState } from 'react';
import type { IDomEditor } from '@wangeditor/editor';

type Props = {
  source: SearchItem[];
  container: HTMLElement;
  editor: IDomEditor;
  renderItem?: RenderItem;
  onSelect: (user: SearchItem) => void;
  onPreSelect: (user: SearchItem | null) => void;
  onCancel: () => void;
};

function RenderTpl(props: Props) {
  const { renderItem, onSelect, onPreSelect, onCancel, container, source } = props;
  const [index, setIndex] = useState(0);
  const onSelectRef = useRef(onSelect);
  const onCancelRef = useRef(onCancel);
  const sourceRef = useRef(source);
  const indexRef = useRef(index);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!container) return;
    const keyDownCallback = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const prevIndex =
            indexRef.current >= (sourceRef.current?.length || 0) - 1 ? 0 : indexRef.current + 1;
          setIndex(prevIndex);
          break;
        case 'ArrowUp':
          event.preventDefault();
          const nextIndex =
            indexRef.current <= 0 ? (sourceRef.current?.length || 0) - 1 : indexRef.current - 1;
          setIndex(nextIndex);
          break;
        case 'Tab':
        case 'Enter':
          event.preventDefault();
          const data = sourceRef.current?.[indexRef.current];
          onSelectRef.current(data);
          break;
        case 'Escape':
          event.preventDefault();
          onCancelRef.current();
          break;
      }
    };
    container.addEventListener('keydown', keyDownCallback);
    return () => {
      container.removeEventListener('keydown', keyDownCallback);
    };
  }, [container]);

  return (
    <div
      className="mention-container"
      style={{ background: '#fff', wordBreak: 'keep-all' }}
      onMouseLeave={() => onPreSelect(null)}
    >
      {source?.map?.((item, currentIndex) => (
        <div
          style={{ background: currentIndex === index ? 'rgba(61, 92, 128, 0.05)' : 'transparent' }}
          className={classNames('mention-item', {
            'mention-item__selected': currentIndex === index,
          })}
          key={item.value}
          data-value={item.value}
          onMouseEnter={() => {
            setIndex(currentIndex);
            onPreSelect(item);
          }}
          onClick={() => onSelect(item)}
        >
          {renderItem?.(item) || item.label}
        </div>
      ))}
    </div>
  );
}

export function mount(container: Element, props: Props) {
  ReactDOM.render(<RenderTpl {...props} />, container);
}

export function unmount(container: Element) {
  container && ReactDOM.unmountComponentAtNode(container);
}
