import type {IHtmlNode} from "~/types/constructor";

export const baseBlock: Omit<IHtmlNode, 'id'> = {
  tag: 'div',
  attrs: {
    class: 'border border-[#FF0000] w-fit pl-[10px]'
  },
  children: ['ПОШЕЛ ГАХУЙ'],
}