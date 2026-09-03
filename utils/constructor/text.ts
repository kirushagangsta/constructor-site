import type {IHtmlNode} from "~/types/constructor";

/** Текст блока — его первый текстовый ребёнок */
export const getNodeText = (node: IHtmlNode) => {
  return (node.children.find((child) => typeof child === 'string') ?? '') as string;
}

/** Пишет текст на место первого текстового ребёнка; пустой текст убирает его совсем */
export const setNodeText = (node: IHtmlNode, text: string) => {
  const textIndex = node.children.findIndex((child) => typeof child === 'string');

  if (!text) {
    if (textIndex !== -1) {
      node.children.splice(textIndex, 1);
    }
    return;
  }

  if (textIndex === -1) {
    node.children.unshift(text);
  } else {
    node.children[textIndex] = text;
  }
}
