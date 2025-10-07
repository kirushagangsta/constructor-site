import type {IHtmlNode} from "~/types/constructor";

export const recursiveFind = (array: Array<IHtmlNode>, targetId: string, depth: number = 1) => {
  // TODO сделать что-то с айди больше 10
  const idSliced = targetId.slice(0 , depth);
  const out = array.find((el: IHtmlNode) => el.id === idSliced);
  if (idSliced === targetId) {
    return out;
  } else if (out) {
    return recursiveFind(out.children, targetId, depth + 1);
  }
}