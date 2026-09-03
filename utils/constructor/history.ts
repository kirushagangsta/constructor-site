import type {IHtmlNode} from "~/types/constructor";
import {PAGE_ID} from "~/utils/constructor/page";
import {getNodeText} from "~/utils/constructor/text";
import {getBlockNumber, getIdPath} from "~/utils/constructor/getId";

/** Узел, разложенный на части, которые правят по отдельности */
interface INodeState {
  tag: string;
  styles: string;
  attrs: string;
  text: string;
}

/** Все узлы дерева по их id — так две страницы удобно сравнивать поблочно */
const collectNodes = (node: IHtmlNode, nodes = new Map<string, INodeState>()) => {
  nodes.set(node.id, {
    tag: node.tag,
    styles: JSON.stringify(node.styles),
    attrs: JSON.stringify(node.attrs),
    text: getNodeText(node),
  });

  node.children.forEach((child) => {
    if (typeof child !== 'string') {
      collectNodes(child, nodes);
    }
  });

  return nodes;
}

/** Как назвать блок в журнале: номер тот же, что в хлебных крошках */
const nodeName = (id: string) => id === PAGE_ID ? 'страницы' : `блока ${getBlockNumber(id)}`;

/** Что именно поменялось в блоке — по порядку от самого заметного */
const describeNodeChange = (id: string, before: INodeState, after: INodeState) => {
  if (before.text !== after.text) {
    return `Изменили текст ${nodeName(id)}`;
  }

  if (before.styles !== after.styles) {
    return `Изменили стили ${nodeName(id)}`;
  }

  if (before.attrs !== after.attrs) {
    return after.tag === 'img' ? `Заменили картинку ${nodeName(id)}` : `Изменили атрибуты ${nodeName(id)}`;
  }

  return `Изменили тег ${nodeName(id)}`;
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
  const byDepth = (first: string, second: string) => getIdPath(first).length - getIdPath(second).length;

  const [added] = [...afterNodes.keys()].filter((id) => !beforeNodes.has(id)).sort(byDepth);

  if (added) {
    return `Добавили блок ${getBlockNumber(added)}`;
  }

  const [removed] = [...beforeNodes.keys()].filter((id) => !afterNodes.has(id)).sort(byDepth);

  if (removed) {
    return `Удалили блок ${getBlockNumber(removed)}`;
  }

  // узлы лежат в порядке обхода дерева, поэтому первый изменившийся — самый верхний
  const changed = [...afterNodes.keys()].find((id) => {
    const before = beforeNodes.get(id)!;
    const after = afterNodes.get(id)!;

    return (Object.keys(after) as Array<keyof INodeState>).some((key) => before[key] !== after[key]);
  });

  return changed ? describeNodeChange(changed, beforeNodes.get(changed)!, afterNodes.get(changed)!) : 'Изменили страницу';
}
