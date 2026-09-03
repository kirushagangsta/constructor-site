import type {IHtmlNode} from "~/types/constructor";
import {PAGE_ID} from "~/utils/constructor/page";

/**
 * id блока — это его место в дереве: номера по уровням вложенности через дефис,
 * например '2-0-11'. Разделитель обязателен: без него одиннадцатый ребёнок блока
 * '2' и первый ребёнок блока '2-1' назывались бы одинаково — и редактор путал бы
 * их между собой. Блоки первого уровня живут без префикса страницы: '0', '1', '2'.
 */
export const buildId = (parentId: string, index: number | string) => {
  return parentId === PAGE_ID ? String(index) : `${parentId}-${index}`;
}

/** Номера блока по уровням вложенности: '2-0-11' → ['2', '0', '11'] */
export const getIdPath = (id: string) => id.split('-');

/**
 * Номер блока, как его видит человек: id '0-2-1-7' читается как '1.3.2.8'.
 * Внутри блоки считаются с нуля, а в редакторе — с единицы.
 */
export const getBlockNumber = (id: string) => {
  return getIdPath(id).map((index) => Number(index) + 1).join('.');
}

/** Сколько блоков уже лежит в узле: текст детьми не считается */
const countChildNodes = (node: IHtmlNode) => {
  return node.children.filter((child) => typeof child !== 'string').length;
}

/** id нового дочернего блока: следующий свободный номер в этом узле */
export const getChildId = (parent: IHtmlNode) => buildId(parent.id, countChildNodes(parent));

/**
 * Раздаёт узлу и его детям новые id — цепочкой номеров от переданного.
 * Пишет id на месте, не подменяя массив детей: иначе в дереве оставались бы
 * реактивные обёртки, а их уже не скопировать в буфер обмена.
 */
const setNodesId = (node: IHtmlNode, id: string): IHtmlNode => {
  let childIndex = 0;

  node.id = id;
  node.children.forEach((child) => {
    if (typeof child !== 'string') {
      setNodesId(child, buildId(id, childIndex++));
    }
  });

  return node;
}

/**
 * Раздаёт детям узла id по их новым местам — вместе со всем, что в них вложено.
 * Нужно после удаления блока: соседи сдвигаются, и их id должны сдвинуться тоже.
 */
export const reindexChildren = (parent: IHtmlNode) => {
  let childIndex = 0;

  parent.children.forEach((child) => {
    if (typeof child !== 'string') {
      setNodesId(child, buildId(parent.id, childIndex++));
    }
  });
}

/**
 * Копия блока со всем содержимым и новыми id: id — это место блока в дереве,
 * поэтому у копии он пересобирается от её нового места.
 * Узел должен быть обычным объектом, без реактивной обёртки.
 */
export const cloneNode = (node: IHtmlNode, id: string): IHtmlNode => {
  return setNodesId(structuredClone(node), id);
}
