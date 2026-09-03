import type {IHtmlNode} from "~/types/constructor";

/**
 * id блока — это его имя, а не место в дереве: он выдаётся один раз и больше
 * никогда не меняется. Поэтому блок можно переносить, удалять его соседей и
 * вкладывать куда угодно — выделение, стили и записи журнала останутся рабочими.
 *
 * Номер вида «1.3.2», который видит человек, из id не выводится: он считается
 * по пути до блока — см. getNodesPath.
 */
const ID_PREFIX = 'b';

/** Нумерация продолжается от того, что уже занято на странице, и не идёт назад */
let lastNumber = 0;

/** id годится, если его можно писать в класс страницы: он уезжает в css как "n-<id>" */
export const isValidId = (id: unknown): id is string => {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(id);
}

export const createId = () => `${ID_PREFIX}${++lastNumber}`;

/**
 * Запоминает занятые id, чтобы новые с ними не совпали. Нужно, когда страница
 * пришла целиком — из файла или из импорта: её id мы оставляем как есть.
 */
export const rememberIds = (ids: Iterable<string>) => {
  for (const id of ids) {
    const number = id.startsWith(ID_PREFIX) ? Number(id.slice(ID_PREFIX.length)) : NaN;

    if (Number.isInteger(number)) {
      lastNumber = Math.max(lastNumber, number);
    }
  }
}

/** Раздаёт узлу и его детям новые id: копия не должна делить их с оригиналом */
const setNewIds = (node: IHtmlNode): IHtmlNode => {
  node.id = createId();
  node.children.forEach((child) => {
    if (typeof child !== 'string') {
      setNewIds(child);
    }
  });

  return node;
}

/**
 * Копия блока со всем содержимым: id у копии свои, остальное — как у оригинала.
 * Узел должен быть обычным объектом, без реактивной обёртки.
 */
export const cloneNode = (node: IHtmlNode): IHtmlNode => setNewIds(structuredClone(node));
