import type {IHtmlNode} from "~/types/constructor";
import {getNodeText} from "~/utils/constructor/text";

/** Узел, разложенный на части, которые правят по отдельности */
interface INodeState {
  /** Номер блока, каким его видит человек: '1.3.2'. У страницы номера нет */
  number: string;
  tag: string;
  styles: string;
  attrs: string;
  text: string;
}

/**
 * Все узлы дерева по их id — так две страницы удобно сравнивать поблочно.
 * id у блока свой и не меняется, поэтому по нему видно и что блок правили,
 * и что он переехал: место записано отдельно, номером.
 */
const collectNodes = (node: IHtmlNode, number = '', nodes = new Map<string, INodeState>()) => {
  nodes.set(node.id, {
    number,
    tag: node.tag,
    styles: JSON.stringify(node.styles),
    attrs: JSON.stringify(node.attrs),
    text: getNodeText(node),
  });

  let childNumber = 0;

  node.children.forEach((child) => {
    if (typeof child !== 'string') {
      childNumber++;
      collectNodes(child, number ? `${number}.${childNumber}` : String(childNumber), nodes);
    }
  });

  return nodes;
}

/** Как назвать блок в журнале: номер тот же, что в хлебных крошках */
const nodeName = (state: INodeState) => state.number ? `блока ${state.number}` : 'страницы';

/** Насколько глубоко лежит блок: '1.3.2' — третий уровень */
const getDepth = (state: INodeState) => state.number.split('.').length;

/** Что именно поменялось в блоке — по порядку от самого заметного */
const describeNodeChange = (before: INodeState, after: INodeState) => {
  if (before.text !== after.text) {
    return `Изменили текст ${nodeName(after)}`;
  }

  if (before.styles !== after.styles) {
    return `Изменили стили ${nodeName(after)}`;
  }

  if (before.attrs !== after.attrs) {
    return after.tag === 'img' ? `Заменили картинку ${nodeName(after)}` : `Изменили атрибуты ${nodeName(after)}`;
  }

  if (before.tag !== after.tag) {
    return `Изменили тег ${nodeName(after)}`;
  }

  // сам блок прежний, а номер другой — значит, он переехал на новое место
  return `Перенесли блок ${before.number} на место ${after.number}`;
}

/**
 * Название действия по двум состояниям страницы: журнал ведётся по правкам
 * дерева, поэтому и понимает, что случилось, из самого дерева.
 */
export const describeChange = (before: IHtmlNode, after: IHtmlNode): string => {
  const beforeNodes = collectNodes(before);
  const afterNodes = collectNodes(after);

  // блок приходит и уходит вместе со всеми вложенными, поэтому берём самый
  // верхний из них: он лежит меньше уровней в глубину
  const byDepth = (first: INodeState, second: INodeState) => getDepth(first) - getDepth(second);

  const [added] = [...afterNodes].filter(([id]) => !beforeNodes.has(id)).map(([, state]) => state).sort(byDepth);

  if (added) {
    return `Добавили блок ${added.number}`;
  }

  const [removed] = [...beforeNodes].filter(([id]) => !afterNodes.has(id)).map(([, state]) => state).sort(byDepth);

  if (removed) {
    return `Удалили блок ${removed.number}`;
  }

  // узлы лежат в порядке обхода дерева, поэтому первый изменившийся — самый верхний
  const changed = [...afterNodes].find(([id, state]) => {
    const previous = beforeNodes.get(id)!;

    return (Object.keys(state) as Array<keyof INodeState>).some((key) => previous[key] !== state[key]);
  });

  return changed ? describeNodeChange(beforeNodes.get(changed[0])!, changed[1]) : 'Изменили страницу';
}
