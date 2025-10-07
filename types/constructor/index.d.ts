export interface IHtmlNode {
  id: string;
  tag: string;
  attrs: object;
  children: Array<IHtmlNode | string>;
}