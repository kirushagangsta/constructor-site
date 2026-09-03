import type {IHtmlNode} from "~/types/constructor";
import {getNodeClass} from "~/utils/constructor/pageCss";
import {voidTags} from "~/constants/constructor/tags";

/**
 * Во что разворачивать ссылки на файлы. Разметка у всех целей одна, а адреса
 * файлов разные — поэтому сборщик их не придумывает, а спрашивает.
 */
export type SrcResolver = (value: string) => string;

const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (value: string) => escapeText(value).replace(/"/g, '&quot;');

/** Свой класс со стилями плюс всё, что пришло из вёрстки */
const buildAttrs = (node: IHtmlNode, resolveSrc: SrcResolver) => {
  const attrs = {
    ...node.attrs,
    class: [getNodeClass(node), node.attrs.class].filter(Boolean).join(' ')
  };

  // через резолвер проходят все значения: ссылку на файл он узнает сам,
  // а остальное вернёт нетронутым — так список атрибутов не надо поддерживать
  return Object.entries(attrs)
    .map(([name, value]) => value ? ` ${name}="${escapeAttr(resolveSrc(value))}"` : ` ${name}`)
    .join('');
}

/**
 * Разметка собирается из дерева, а не из холста: на холсте у блоков нет
 * их собственных классов (иначе бы их подхватил tailwind редактора),
 * да и служебные атрибуты выбора блока туда попадать не должны.
 */
const buildNodeHtml = (node: IHtmlNode, resolveSrc: SrcResolver): string => {
  const openTag = `<${node.tag}${buildAttrs(node, resolveSrc)}>`;

  if (voidTags.has(node.tag)) {
    return openTag;
  }

  const children = node.children
    .map((child) => typeof child === 'string' ? escapeText(child) : buildNodeHtml(child, resolveSrc))
    .join('');

  return `${openTag}${children}</${node.tag}>`;
}

/** Разметка страницы для файла: css уезжает отдельно и попадает в head документа */
export const buildPageBodyHtml = (page: IHtmlNode, resolveSrc: SrcResolver) => buildNodeHtml(page, resolveSrc);

/** Самостоятельная html-страница — её и показываем в превью */
export const buildPreviewHtml = (page: IHtmlNode, css: string, resolveSrc: SrcResolver) => {
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Превью страницы</title>
<style>
${css}
</style>
</head>
<body>
${buildNodeHtml(page, resolveSrc)}
</body>
</html>`;
}
