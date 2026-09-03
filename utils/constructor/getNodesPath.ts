import type {IHtmlNode} from "~/types/constructor";

/** Шаг пути: сам блок и какой он по счёту среди соседей — счёт с единицы */
export interface IPathStep {
  node: IHtmlNode;
  number: number;
}

/**
 * Путь от самого главного блока до нужного. id блока ничего не говорит о его
 * месте, поэтому блок ищется обходом дерева — заодно по дороге считаются номера,
 * которыми блоки называют человеку.
 * Пустой путь значит, что такого блока на странице больше нет.
 */
export const getNodesPath = (parent: IHtmlNode, targetId: string): IPathStep[] => {
  let number = 0;

  for (const child of parent.children) {
    if (typeof child === 'string') {
      continue;
    }

    number++;

    if (child.id === targetId) {
      return [{node: child, number}];
    }

    const path = getNodesPath(child, targetId);

    if (path.length) {
      return [{node: child, number}, ...path];
    }
  }

  return [];
}

/** Номер блока, каким его видит человек: '1.3.2' — место блока по уровням вложенности */
export const getBlockNumber = (path: IPathStep[]) => path.map((step) => step.number).join('.');
