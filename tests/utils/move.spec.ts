import {describe, it, expect, beforeEach} from 'vitest';
import type {IHtmlNode} from '~/types/constructor';
import {moveNode} from '~/utils/constructor/move';
import {createPageNode, PAGE_ID} from '~/utils/constructor/page';
import {getNodesPath} from '~/utils/constructor/getNodesPath';

const node = (id: string, children: Array<IHtmlNode | string> = [], tag = 'div'): IHtmlNode => ({
  id,
  tag,
  styles: {},
  attrs: {},
  children,
});

/** Порядок блоков внутри узла — текст пропускаем, он в нумерации не участвует */
const blockIds = (parent: IHtmlNode) =>
  parent.children.filter((child): child is IHtmlNode => typeof child !== 'string').map((child) => child.id);

describe('перенос блока', () => {
  let page: IHtmlNode;

  beforeEach(() => {
    page = createPageNode([
      node('a'),
      node('b'),
      node('c', [node('c1')]),
    ]);
  });

  it('поднимает блок выше внутри одного родителя', () => {
    expect(moveNode(page, 'c', PAGE_ID, 0)).toBe(true);
    expect(blockIds(page)).toEqual(['c', 'a', 'b']);
  });

  it('при переносе вниз учитывает, что вырезанный блок сдвигает место вставки', () => {
    // номер 2 — это место, где сейчас стоит 'c'. После вырезания 'a' всё съезжает
    // на единицу, поэтому 'a' встаёт перед 'c', а не после него
    expect(moveNode(page, 'a', PAGE_ID, 2)).toBe(true);
    expect(blockIds(page)).toEqual(['b', 'a', 'c']);
  });

  it('считает перенос на соседнее место вниз бессмысленным', () => {
    // 'a' и так стоит перед 'b' — после вырезания и вставки ничего бы не изменилось
    expect(moveNode(page, 'a', PAGE_ID, 1)).toBe(false);
    expect(blockIds(page)).toEqual(['a', 'b', 'c']);
  });

  it('кладёт блок внутрь другого блока', () => {
    expect(moveNode(page, 'a', 'c', 0)).toBe(true);

    const target = getNodesPath(page, 'c').at(-1)!.node;

    expect(blockIds(page)).toEqual(['b', 'c']);
    expect(blockIds(target)).toEqual(['a', 'c1']);
  });

  it('вытаскивает вложенный блок наверх', () => {
    expect(moveNode(page, 'c1', PAGE_ID, 0)).toBe(true);
    expect(blockIds(page)).toEqual(['c1', 'a', 'b', 'c']);
  });

  it('не трогает id — за блоком едут стили и журнал', () => {
    const moved = getNodesPath(page, 'a').at(-1)!.node;
    moved.styles = {base: {color: 'red'}};

    moveNode(page, 'a', 'c', 0);

    const after = getNodesPath(page, 'a').at(-1)!.node;

    expect(after.id).toBe('a');
    expect(after.styles.base).toEqual({color: 'red'});
  });

  it('ставит блок в конец, если номер больше, чем есть детей', () => {
    expect(moveNode(page, 'a', PAGE_ID, 99)).toBe(true);
    expect(blockIds(page)).toEqual(['b', 'c', 'a']);
  });
});

describe('перенос, который делать нельзя', () => {
  let page: IHtmlNode;

  beforeEach(() => {
    page = createPageNode([
      node('a', [node('a1', [node('a2')])]),
      node('pic', [], 'img'),
    ]);
  });

  it('отказывается класть блок внутрь самого себя', () => {
    expect(moveNode(page, 'a', 'a', 0)).toBe(false);
    expect(blockIds(page)).toEqual(['a', 'pic']);
  });

  it('отказывается класть блок внутрь собственного потомка', () => {
    expect(moveNode(page, 'a', 'a2', 0)).toBe(false);
    expect(blockIds(page)).toEqual(['a', 'pic']);
  });

  it('отказывается класть блок внутрь пустого тега', () => {
    expect(moveNode(page, 'a', 'pic', 0)).toBe(false);

    const picture = getNodesPath(page, 'pic').at(-1)!.node;

    expect(picture.children).toHaveLength(0);
  });

  it('отказывается двигать блок на его же место', () => {
    expect(moveNode(page, 'a', PAGE_ID, 0)).toBe(false);
  });

  it('отказывается, если блока на странице нет', () => {
    expect(moveNode(page, 'b404', PAGE_ID, 0)).toBe(false);
  });

  it('отказывается, если родителя на странице нет', () => {
    expect(moveNode(page, 'a', 'b404', 0)).toBe(false);
    expect(blockIds(page)).toEqual(['a', 'pic']);
  });
});

describe('перенос среди текста', () => {
  it('считает номер только по блокам, текст остаётся на месте', () => {
    const page = createPageNode([
      'текст сверху',
      node('a'),
      'текст между',
      node('b'),
    ]);

    expect(moveNode(page, 'b', PAGE_ID, 0)).toBe(true);
    expect(blockIds(page)).toEqual(['b', 'a']);
    expect(page.children.filter((child) => typeof child === 'string')).toHaveLength(2);
  });
});
