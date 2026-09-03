import type {IHtmlNode} from "~/types/constructor";

export const baseBlock: Omit<IHtmlNode, 'id'> = {
  tag: 'div',
  styles: {
    base: {width: 'fit-content'}
  },
  attrs: {},
  children: ['ПОШЕЛ ГАХУЙ'],
}
