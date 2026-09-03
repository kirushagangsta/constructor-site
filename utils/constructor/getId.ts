import type {IHtmlNode} from "~/types/constructor";

/** id нового дочернего блока: id родителя + порядковый номер среди вложенных блоков */
export const getTargetId = (target: IHtmlNode) => {
  const childNodesCount = target.children.filter((child) => typeof child !== 'string').length;
  return `${target.id}${childNodesCount}`;
}
