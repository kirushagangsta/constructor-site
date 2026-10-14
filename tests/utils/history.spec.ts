import {describe, it, expect} from 'vitest';
import type {IHtmlNode} from '~/types/constructor';
import {describeChange} from '~/utils/constructor/history';
import {createPageNode} from '~/utils/constructor/page';
import {cloneNode} from '~/utils/constructor/getId';

const node = (id: string, children: Array<IHtmlNode | string> = [], tag = 'div'): IHtmlNode => ({
  id,
  tag,
  styles: {},
  attrs: {},
  children,
});

/** Копия страницы, не связанная с оригиналом: id сохраняем, иначе сравнивать нечего */
const copy = (page: IHtmlNode): IHtmlNode => JSON.parse(JSON.stringify(page));

/**
 * id нарочно не из пространства генератора: createId выдаёт 'b1', 'b2', и если
 * назвать блок так же руками, копия совпадёт с уже существующим блоком.
 * В приложении этого не случается — там id либо выданы генератором,
 * либо зарегистрированы через rememberIds.
 */
const basePage = () => createPageNode([
  node('x1', ['Заголовок']),
  node('x2', [node('x3')]),
]);

describe('название действия для журнала', () => {
  it('замечает добавленный блок и называет его номер', () => {
    const before = basePage();
    const after = copy(before);
    after.children.push(node('c'));

    expect(describeChange(before, after)).toBe('Добавили блок 3');
  });

  it('при добавлении ветки называет самый верхний блок, а не вложенный', () => {
    const before = basePage();
    const after = copy(before);
    after.children.push(node('c', [node('c1', [node('c2')])]));

    expect(describeChange(before, after)).toBe('Добавили блок 3');
  });

  it('замечает удалённый блок', () => {
    const before = basePage();
    const after = copy(before);
    after.children.pop();

    expect(describeChange(before, after)).toBe('Удалили блок 2');
  });

  it('замечает изменённый текст', () => {
    const before = basePage();
    const after = copy(before);
    (after.children[0] as IHtmlNode).children[0] = 'Другой заголовок';

    expect(describeChange(before, after)).toBe('Изменили текст блока 1');
  });

  it('замечает изменённые стили', () => {
    const before = basePage();
    const after = copy(before);
    (after.children[0] as IHtmlNode).styles = {base: {color: 'red'}};

    expect(describeChange(before, after)).toBe('Изменили стили блока 1');
  });

  it('про картинку говорит «заменили картинку», а не «атрибуты»', () => {
    const before = createPageNode([node('pic', [], 'img')]);
    const after = copy(before);
    (after.children[0] as IHtmlNode).attrs = {src: '/new.png'};

    expect(describeChange(before, after)).toBe('Заменили картинку блока 1');
  });

  it('для обычного блока говорит про атрибуты', () => {
    const before = basePage();
    const after = copy(before);
    (after.children[0] as IHtmlNode).attrs = {href: '/about'};

    expect(describeChange(before, after)).toBe('Изменили атрибуты блока 1');
  });

  it('замечает смену тега', () => {
    const before = basePage();
    const after = copy(before);
    (after.children[0] as IHtmlNode).tag = 'section';

    expect(describeChange(before, after)).toBe('Изменили тег блока 1');
  });

  it('называет правку самой страницы, а не блока', () => {
    const before = basePage();
    const after = copy(before);
    after.styles = {base: {background: 'white'}};

    expect(describeChange(before, after)).toBe('Изменили стили страницы');
  });

  it('понимает, что блок переехал, раз он сам не менялся', () => {
    const before = basePage();
    const after = copy(before);
    const [first, second] = after.children as IHtmlNode[];
    after.children = [second, first];

    expect(describeChange(before, after)).toBe('Перенесли блок 2 на место 1');
  });

  it('не выдумывает действие, когда страница не изменилась', () => {
    const before = basePage();

    expect(describeChange(before, copy(before))).toBe('Изменили страницу');
  });

  it('вставку копии считает добавлением: у копии свои id', () => {
    const before = basePage();
    const after = copy(before);
    after.children.push(cloneNode(after.children[0] as IHtmlNode));

    expect(describeChange(before, after)).toBe('Добавили блок 3');
  });
});
