import type {IHtmlNode} from "~/types/constructor";

export const getTargetId = (target: IHtmlNode) => {
  return target.id.toString() + target.children.filter((el: IHtmlNode | string) => typeof el !== 'string').length.toString();
}