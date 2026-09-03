import type {IHtmlNode} from "~/types/constructor";

export type BlockKind = 'block' | 'image';

export const baseBlock: Omit<IHtmlNode, 'id'> = {
  tag: 'div',
  styles: {
    base: {width: 'fit-content'}
  },
  attrs: {},
  children: ['ПОШЕЛ ГАХУЙ'],
}

/**
 * Картинка — такой же блок, только вместо текста у него файл в src.
 * Своих стилей не задаём: сброс страницы уже вписывает картинку в родителя
 * и сохраняет пропорции.
 */
export const imageBlock: Omit<IHtmlNode, 'id'> = {
  tag: 'img',
  styles: {},
  attrs: {src: '', alt: ''},
  children: [],
}

export const blockPresets: Record<BlockKind, Omit<IHtmlNode, 'id'>> = {
  block: baseBlock,
  image: imageBlock,
}
