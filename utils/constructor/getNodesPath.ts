import type {IHtmlNode} from "~/types/constructor";
import {buildId, getIdPath} from "~/utils/constructor/getId";
import {PAGE_ID} from "~/utils/constructor/page";

/**
 * Путь от самого главного блока до выбранного, например ['0', '0-1', '0-1-2'].
 * id блока — номера по уровням вложенности, поэтому каждый следующий уровень
 * ищется по id, собранному из очередного номера.
 */
export const getNodesPath = (nodes: Array<IHtmlNode>, targetId: string): IHtmlNode[] => {
  const path: IHtmlNode[] = [];
  let currentLevel = nodes;
  let currentId = PAGE_ID;

  for (const index of getIdPath(targetId)) {
    currentId = buildId(currentId, index);

    const node = currentLevel.find((el: IHtmlNode) => el.id === currentId);

    if (!node) {
      return [];
    }

    path.push(node);
    currentLevel = node.children as IHtmlNode[];
  }

  return path;
}
