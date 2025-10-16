import type {CssPropertyName} from "~/types/cssClasses";

export interface IHtmlNode {
  id: string;
  tag: string;
  attrs: {
    class?: string;
    style?: Record<Partial<CssPropertyName>, string>;
  };
  children: Array<IHtmlNode | string>;
}