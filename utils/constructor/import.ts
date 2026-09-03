import type {CssDeclarations, IHtmlNode, StyleVariant} from "~/types/constructor";
import {createPageNode, PAGE_ID} from "~/utils/constructor/page";
import {styleVariants} from "~/constants/constructor/breakpoints";
import {normalizeStyle} from "~/utils/cssClasses/extractor";
import {stylesFromClasses} from "~/utils/cssClasses/tailwind";
import {normalizeAssetSrc} from "~/utils/constructor/assets";
import {createId, isValidId, rememberIds} from "~/utils/constructor/getId";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Теги, которые в страницу не пускаем: скрипт выполнился бы и в редакторе,
 * и в скачанном файле, а style и base переписали бы оформление и все ссылки.
 */
const forbiddenTags = ['script', 'style', 'link', 'meta', 'base', 'object', 'embed'];

/** Стили — объект «css-свойство → значение»; всё остальное отбрасываем */
const parseDeclarations = (declarations: unknown): CssDeclarations => {
  if (!isPlainObject(declarations)) {
    return {};
  }

  const entries = Object.entries(declarations).filter(([, value]) => typeof value === 'string');

  return normalizeStyle(Object.fromEntries(entries) as CssDeclarations);
}

/**
 * Оформление узла может быть записано тремя способами, и все они означают одно.
 * Классы — самое слабое звено: их css собирается из исходников проекта, поэтому
 * в данных они ничего не рисуют. Идут первыми, а более явные записи их перебивают.
 *
 * Инлайновый style относится ко всем экранам, а контрольные точки приезжают
 * либо префиксом класса ("md:flex"), либо своим вариантом в styles.
 */
const parseStyles = (node: Record<string, unknown>, classAttr: string): IHtmlNode['styles'] => {
  const attrs = isPlainObject(node.attrs) ? node.attrs : {};
  const savedStyles = isPlainObject(node.styles) ? node.styles : {};
  const classStyles = stylesFromClasses(classAttr);

  const styles: IHtmlNode['styles'] = {};

  styleVariants.forEach((variant: StyleVariant) => {
    const declarations = {
      ...normalizeStyle(classStyles[variant]),
      ...(variant === 'base' ? parseDeclarations(attrs.style) : {}),
      ...parseDeclarations(savedStyles[variant]),
    };

    if (Object.keys(declarations).length) {
      styles[variant] = declarations;
    }
  });

  return styles;
}

/**
 * id из файла берём как есть: это имя блока, а не его место, и за сохранённой
 * страницей оно должно оставаться между заходами. Не берём только то, что
 * сломает класс страницы или уже занято другим блоком, — таким раздаём новые.
 */
const takeId = (savedId: unknown, claimed: Set<string>) => {
  const id = isValidId(savedId) && !claimed.has(savedId) ? savedId : createId();

  claimed.add(id);

  return id;
}

/** Все id, что уже заняты в файле: новые не должны с ними совпасть */
const collectSavedIds = (node: unknown, ids: string[] = []): string[] => {
  if (!isPlainObject(node)) {
    return ids;
  }

  if (isValidId(node.id)) {
    ids.push(node.id);
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => collectSavedIds(child, ids));
  }

  return ids;
}

const parseChildren = (children: unknown, claimed: Set<string>): Array<IHtmlNode | string> => {
  if (!Array.isArray(children)) {
    return [];
  }

  const parsed: Array<IHtmlNode | string> = [];

  children.forEach((child) => {
    if (typeof child === 'string') {
      if (child) {
        parsed.push(child);
      }
      return;
    }

    const node = parseNode(child, claimed);

    if (node) {
      parsed.push(node);
    }
  });

  return parsed;
}

/**
 * Значение атрибута как его хранит дерево. Классы уже разобраны отдельно,
 * а путь до картинки из старых страниц становится ссылкой на файл: адрес
 * ей подберёт резолвер, когда страницу будут собирать.
 */
const parseAttrValue = (name: string, value: string, classAttr: string) => {
  if (name === 'class') {
    return classAttr;
  }

  return name === 'src' ? normalizeAssetSrc(value) : value;
}

const parseNode = (node: unknown, claimed: Set<string>, pageId?: string): Nullable<IHtmlNode> => {
  if (!isPlainObject(node)) {
    return null;
  }

  const id = pageId ?? takeId(node.id, claimed);

  const rawAttrs = isPlainObject(node.attrs) ? node.attrs : {};
  const classAttr = typeof rawAttrs.class === 'string' ? rawAttrs.class.trim() : '';
  const tag = typeof node.tag === 'string' ? node.tag.trim() : '';

  // href, id, alt и прочее нужны готовой странице; style уехал в стили,
  // а обработчики событий из чужого json выполнять точно не стоит
  const attrs = Object.fromEntries(
    Object.entries(rawAttrs)
      .filter(([name, value]) => typeof value === 'string' && name !== 'style' && !name.startsWith('on'))
      .map(([name, value]) => [name, parseAttrValue(name, value as string, classAttr)])
  );

  return {
    id,
    tag: tag || 'div',
    styles: parseStyles(node, classAttr),
    attrs: classAttr || Object.keys(attrs).length ? attrs : {},
    children: parseChildren(node.children, claimed)
  };
}

/**
 * Собирает страницу из json — и своего, и чужого.
 * Понимает ответ целиком ({ content: ... }), массив с узлом-страницей,
 * просто массив блоков и один блок.
 */
export const parsePageContent = (content: string): IHtmlNode => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Это не похоже на json — проверьте, что скопировали его целиком');
  }

  const nodesSource = isPlainObject(parsed) && 'content' in parsed ? parsed.content : parsed;

  // content с сервера приходит строкой — внутри неё лежит то же самое дерево
  if (typeof nodesSource === 'string') {
    return parsePageContent(nodesSource);
  }

  const nodes = Array.isArray(nodesSource) ? nodesSource : [nodesSource];

  // новые блоки этой страницы должны получать id, которых в ней ещё нет
  rememberIds(nodes.flatMap((node) => collectSavedIds(node)));

  // id страницы занят ею самой: блок из файла с таким же именем получит новый
  const claimed = new Set([PAGE_ID]);
  const savedPage = nodes.find((node) => isPlainObject(node) && node.id === PAGE_ID);

  return savedPage
    ? parseNode(savedPage, claimed, PAGE_ID)!
    : createPageNode(parseChildren(nodes, claimed));
}

/** То же самое, но для импорта: пустая страница значит, что вставили не то */
export const parseImportedPage = (content: string): IHtmlNode => {
  const page = parsePageContent(content);

  if (!page.children.length) {
    throw new Error('В этом json нет ни одного блока');
  }

  return page;
}
