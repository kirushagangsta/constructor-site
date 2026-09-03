import type {IHtmlNode} from "~/types/constructor";
import {getNodesPath} from "~/utils/constructor/getNodesPath";
import {PAGE_ID} from "~/utils/constructor/page";
import {voidTags} from "~/constants/constructor/tags";

/**
 * Место в children, где лежит блок с этим номером. В children вперемешку лежат
 * блоки и текст, а считаем мы только блоки — поэтому номер приходится переводить.
 */
const getChildrenIndex = (parent: IHtmlNode, index: number) => {
  let blocks = 0;

  for (let position = 0; position < parent.children.length; position++) {
    if (typeof parent.children[position] === 'string') {
      continue;
    }

    if (blocks === index) {
      return position;
    }

    blocks++;
  }

  return parent.children.length;
}

/**
 * Переносит блок в новое место: вырезает из старого родителя и вставляет в нового
 * под номером index (текст детьми не считается). id при этом не трогаются — блок
 * остаётся собой, поэтому за ним едут и стили, и выделение, и записи журнала.
 *
 * Возвращает false, если переносить нечего или некуда: блок нельзя положить
 * внутрь самого себя и внутрь пустого тега, а на своё же место — незачем.
 */
export const moveNode = (page: IHtmlNode, id: string, parentId: string, index: number): boolean => {
  const path = getNodesPath(page, id);
  const node = path.at(-1)?.node;
  const from = path.at(-2)?.node ?? page;
  const to = parentId === PAGE_ID ? page : getNodesPath(page, parentId).at(-1)?.node;

  if (!node || !to || to === node || voidTags.has(to.tag) || getNodesPath(node, parentId).length) {
    return false;
  }

  const fromIndex = from.children.findIndex((child) => typeof child !== 'string' && child.id === id);
  const rawIndex = getChildrenIndex(to, index);
  // вырезанный блок сдвигает место вставки, если оно было ниже него
  const toIndex = from === to && fromIndex < rawIndex ? rawIndex - 1 : rawIndex;

  if (fromIndex === -1 || (from === to && toIndex === fromIndex)) {
    return false;
  }

  from.children.splice(fromIndex, 1);
  to.children.splice(toIndex, 0, node);

  return true;
}
