import type {IHtmlNode} from "~/types/constructor";

/**
 * Путь от самого главного блока до выбранного, например ['0', '01', '012'].
 * id блока — цепочка индексов по уровням вложенности, поэтому каждый
 * следующий уровень ищется по более длинному префиксу id.
 * TODO сделать что-то с айди больше 10
 */
export const getNodesPath = (nodes: Array<IHtmlNode>, targetId: string): IHtmlNode[] => {
  const path: IHtmlNode[] = [];
  let currentLevel = nodes;

  for (let depth = 1; depth <= targetId.length; depth++) {
    const node = currentLevel.find((el: IHtmlNode) => el.id === targetId.slice(0, depth));

    if (!node) {
      return [];
    }

    path.push(node);
    currentLevel = node.children as IHtmlNode[];
  }

  return path;
}
