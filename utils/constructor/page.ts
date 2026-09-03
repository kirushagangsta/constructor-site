import type {IHtmlNode} from "~/types/constructor";

/** Зарезервированный id корневого узла — самой страницы */
export const PAGE_ID = 'page';

/** Страница — такой же узел, как блок: у неё есть свои стили */
export const createPageNode = (children: Array<IHtmlNode | string> = []): IHtmlNode => ({
  id: PAGE_ID,
  tag: 'div',
  styles: {},
  attrs: {},
  children
});
