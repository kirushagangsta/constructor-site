import type {CssDeclarations, IHtmlNode, StyleVariant} from "~/types/constructor";
import {breakpoints, styleVariants} from "~/constants/constructor/breakpoints";
import {pageReset} from "~/constants/constructor/pageReset";

/** Класс, по которому к узлу цепляются его собственные стили */
export const getNodeClass = (node: IHtmlNode) => `n-${node.id}`;

const collectNodes = (node: IHtmlNode): IHtmlNode[] => {
  return node.children.reduce<IHtmlNode[]>(
    (nodes, child) => typeof child === 'string' ? nodes : [...nodes, ...collectNodes(child)],
    [node]
  );
}

const indent = (text: string) => text.split('\n').map((line) => line && `  ${line}`).join('\n');

/** Правило одного узла; пустой набор стилей правила не даёт */
const buildRule = (node: IHtmlNode, declarations: CssDeclarations = {}) => {
  const body = Object.entries(declarations)
    .filter(([, value]) => value !== '')
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');

  return body ? `.${getNodeClass(node)} {\n${body}\n}` : '';
}

/**
 * Стили узла на выбранной ширине: варианты поменьше складываются в один набор,
 * поэтому 'md' — это база плюс 'sm' плюс собственные правки.
 */
export const getVariantDeclarations = (node: IHtmlNode, variant: StyleVariant): CssDeclarations => {
  return styleVariants
    .slice(0, styleVariants.indexOf(variant) + 1)
    .reduce((declarations, name) => ({...declarations, ...node.styles[name]}), {});
}

/**
 * Css страницы для файла и превью: сброс стилей браузера, база
 * и медиазапросы по контрольным точкам.
 */
export const buildPageCss = (page: IHtmlNode): string => {
  const nodes = collectNodes(page);

  const rules = breakpoints
    .map(({name, minWidth}) => {
      const rules = nodes.map((node) => buildRule(node, node.styles[name])).filter(Boolean).join('\n\n');

      if (!rules) {
        return '';
      }

      return minWidth ? `@media (min-width: ${minWidth}px) {\n${indent(rules)}\n}` : rules;
    })
    .filter(Boolean)
    .join('\n\n');

  return `${pageReset}\n\n${rules}`;
}

/**
 * Css для холста. Медиазапросы здесь не годятся: они смотрят на ширину окна,
 * а не холста — поэтому показываем страницу такой, какой она будет на выбранной ширине.
 */
export const buildEditorCss = (page: IHtmlNode, variant: StyleVariant): string => {
  return collectNodes(page)
    .map((node) => buildRule(node, getVariantDeclarations(node, variant)))
    .filter(Boolean)
    .join('\n\n');
}
