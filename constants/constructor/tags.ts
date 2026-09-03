/** Теги без закрывающей части: у них не бывает ни детей, ни текста */
export const voidTags = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]);
