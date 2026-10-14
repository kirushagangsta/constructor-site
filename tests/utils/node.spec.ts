import {describe, it, expect} from 'vitest';
import type {IHtmlNode} from '~/types/constructor';
import {isValidId, createId, rememberIds, cloneNode} from '~/utils/constructor/getId';
import {getNodesPath, getBlockNumber} from '~/utils/constructor/getNodesPath';
import {getNodeText, setNodeText} from '~/utils/constructor/text';

const node = (id: string, children: Array<IHtmlNode | string> = [], tag = 'div'): IHtmlNode => ({
  id,
  tag,
  styles: {},
  attrs: {},
  children,
});

describe('id блока', () => {
  it('принимает id, который можно записать в класс страницы', () => {
    expect(isValidId('b1')).toBe(true);
    expect(isValidId('Block_1-a')).toBe(true);
  });

  it('отбрасывает всё, что сломает css-класс или не является строкой', () => {
    expect(isValidId('b 1')).toBe(false);
    expect(isValidId('b.1')).toBe(false);
    expect(isValidId('')).toBe(false);
    expect(isValidId('x'.repeat(41))).toBe(false);
    expect(isValidId(42)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
  });

  it('выдаёт каждый раз новый id', () => {
    const first = createId();
    const second = createId();

    expect(first).not.toBe(second);
    expect(isValidId(first)).toBe(true);
  });

  it('не повторяет id, которые уже заняты на пришедшей странице', () => {
    rememberIds(['b50', 'b7']);

    expect(createId()).toBe('b51');
  });

  it('не сдвигает нумерацию назад и переживает чужие id', () => {
    rememberIds(['b100']);
    rememberIds(['b3', 'custom-id', 'bXX']);

    expect(createId()).toBe('b101');
  });
});

describe('копия блока', () => {
  it('выдаёт новые id и самому блоку, и всем вложенным', () => {
    const original = node('b1', [node('b2', [node('b3')])]);

    const copy = cloneNode(original);
    const child = copy.children[0] as IHtmlNode;
    const grandchild = child.children[0] as IHtmlNode;

    expect(copy.id).not.toBe('b1');
    expect(child.id).not.toBe('b2');
    expect(grandchild.id).not.toBe('b3');
    expect(new Set([copy.id, child.id, grandchild.id]).size).toBe(3);
  });

  it('сохраняет содержимое и не делит его с оригиналом', () => {
    const original = node('b1', ['Привет', node('b2')], 'section');
    original.styles = {base: {color: 'red'}};
    original.attrs = {href: '/about'};

    const copy = cloneNode(original);
    copy.styles.base!.color = 'blue';

    expect(copy.tag).toBe('section');
    expect(copy.attrs).toEqual({href: '/about'});
    expect(copy.children[0]).toBe('Привет');
    expect(original.styles.base!.color).toBe('red');
  });
});

describe('путь до блока', () => {
  const page = node('page', [
    node('b1'),
    node('b2', [
      'текст между блоками',
      node('b3'),
      node('b4', [node('b5')]),
    ]),
  ]);

  it('находит блок на верхнем уровне', () => {
    const path = getNodesPath(page, 'b2');

    expect(path).toHaveLength(1);
    expect(path[0].node.id).toBe('b2');
    expect(path[0].number).toBe(2);
  });

  it('спускается до вложенного блока и ведёт весь путь', () => {
    const path = getNodesPath(page, 'b5');

    expect(path.map((step) => step.node.id)).toEqual(['b2', 'b4', 'b5']);
  });

  it('считает номера только по блокам, текст не в счёт', () => {
    const path = getNodesPath(page, 'b3');

    expect(getBlockNumber(path)).toBe('2.1');
  });

  it('собирает человеческий номер вложенного блока', () => {
    expect(getBlockNumber(getNodesPath(page, 'b5'))).toBe('2.2.1');
  });

  it('возвращает пустой путь, если блока на странице нет', () => {
    expect(getNodesPath(page, 'b404')).toEqual([]);
    expect(getBlockNumber([])).toBe('');
  });
});

describe('текст блока', () => {
  it('отдаёт первый текстовый кусок', () => {
    expect(getNodeText(node('b1', [node('b2'), 'Заголовок']))).toBe('Заголовок');
  });

  it('отдаёт пустую строку, если текста нет', () => {
    expect(getNodeText(node('b1', [node('b2')]))).toBe('');
  });

  it('дописывает текст в начало, когда его ещё не было', () => {
    const target = node('b1', [node('b2')]);

    setNodeText(target, 'Новый');

    expect(target.children[0]).toBe('Новый');
    expect(target.children).toHaveLength(2);
  });

  it('заменяет текст на месте, не трогая вложенные блоки', () => {
    const target = node('b1', [node('b2'), 'Старый', node('b3')]);

    setNodeText(target, 'Новый');

    expect(target.children[1]).toBe('Новый');
    expect(target.children).toHaveLength(3);
  });

  it('убирает текст совсем, если передали пустую строку', () => {
    const target = node('b1', ['Старый', node('b2')]);

    setNodeText(target, '');

    expect(target.children).toHaveLength(1);
    expect(getNodeText(target)).toBe('');
  });

  it('ничего не ломает, когда убирать нечего', () => {
    const target = node('b1', [node('b2')]);

    setNodeText(target, '');

    expect(target.children).toHaveLength(1);
  });
});
