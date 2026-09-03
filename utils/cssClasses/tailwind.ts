/**
 * Перевод классов tailwind в обычный css.
 *
 * Классы с произвольными значениями ("w-[320px]") tailwind собирает из исходников
 * проекта, поэтому в пользовательских данных их просто не существует — импортированная
 * страница рисуется инлайновыми стилями, собранными здесь.
 *
 * Поддержана ходовая часть утилит: раскладка, размеры, отступы, текст, рамки, тени.
 * Цвета из палитры ("bg-amber-900") не переводятся — их значения знает только сборка.
 */

import type {CssDeclarations, StyleVariant} from "~/types/constructor";
import {styleVariants} from "~/constants/constructor/breakpoints";

/** Одно значение на одно или несколько свойств: "10px" → padding-left и padding-right */
const toDeclarations = (properties: string[], value: string): CssDeclarations => {
  return value ? Object.fromEntries(properties.map((property) => [property, value])) : {};
}

const isArbitrary = (value: string) => value.startsWith('[') && value.endsWith(']');

/** В произвольных значениях пробелы записываются подчёркиваниями: "1fr_2fr" → "1fr 2fr" */
const fromArbitrary = (value: string) => value.slice(1, -1).replace(/_/g, ' ').trim();

const isColorValue = (value: string) => /^(#|rgba?\(|hsla?\()/i.test(value);

const isNumber = (value: string) => /^-?\d+(\.\d+)?$/.test(value);

/** Цвета, понятные без палитры темы */
const namedColors: CssDeclarations = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
};

const fontSizes: CssDeclarations = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
  '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem', '5xl': '3rem',
  '6xl': '3.75rem', '7xl': '4.5rem', '8xl': '6rem', '9xl': '8rem',
};

const fontWeights: CssDeclarations = {
  thin: '100', extralight: '200', light: '300', normal: '400', medium: '500',
  semibold: '600', bold: '700', extrabold: '800', black: '900',
};

const fontFamilies: CssDeclarations = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, monospace',
};

const borderRadii: CssDeclarations = {
  none: '0', sm: '0.125rem', DEFAULT: '0.25rem', md: '0.375rem', lg: '0.5rem',
  xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', full: '9999px',
};

const boxShadows: CssDeclarations = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

const lineHeights: CssDeclarations = {
  none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2',
};

const letterSpacings: CssDeclarations = {
  tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em', widest: '0.1em',
};

/** Слова, которыми размер записывают вместо числа */
const namedSizes: CssDeclarations = {
  auto: 'auto', full: '100%', fit: 'fit-content', min: 'min-content', max: 'max-content',
  none: 'none', px: '1px', prose: '65ch',
};

/** Размер: "[320px]" → 320px, "4" → 1rem (шкала 0.25rem), "1/2" → 50%, "screen" → 100vh */
const toSizeValue = (value: string, isVertical = false): string => {
  if (isArbitrary(value)) {
    return fromArbitrary(value);
  }

  if (value === 'screen') {
    return isVertical ? '100vh' : '100vw';
  }

  if (namedSizes[value]) {
    return namedSizes[value];
  }

  const fraction = value.match(/^(\d+)\/(\d+)$/);

  if (fraction) {
    return `${+(Number(fraction[1]) / Number(fraction[2]) * 100).toFixed(4)}%`;
  }

  return isNumber(value) ? `${Number(value) * 0.25}rem` : '';
}

/** Цвет: "[#3b2921]" → #3b2921, "white" → #ffffff; цвета палитры остаются нераспознанными */
const toColorValue = (value: string): string => {
  if (isArbitrary(value)) {
    const arbitraryValue = fromArbitrary(value);
    return isColorValue(arbitraryValue) ? arbitraryValue : '';
  }

  return namedColors[value] ?? '';
}

/** Значение из именованной шкалы — тени, скругления, толщины шрифта */
const toScaleValue = (scale: CssDeclarations, value: string) => {
  return isArbitrary(value) ? fromArbitrary(value) : scale[value] ?? '';
}

/** "border-2" — толщина, "border-[#eadfd8]" — цвет; стиль дописываем, иначе рамки не видно */
const toBorderDeclarations = (prefixes: string[], value: string): CssDeclarations => {
  const color = toColorValue(value);

  if (color) {
    return toDeclarations(prefixes.map((prefix) => `${prefix}-color`), color);
  }

  const width = isArbitrary(value) ? fromArbitrary(value) : (isNumber(value) ? `${value}px` : '');

  return width
    ? {
      ...toDeclarations(prefixes.map((prefix) => `${prefix}-width`), width),
      ...toDeclarations(prefixes.map((prefix) => `${prefix}-style`), 'solid'),
    }
    : {};
}

/** Число дорожек сетки: "3" → repeat(3, minmax(0, 1fr)) */
const toGridTracks = (value: string) => {
  if (isArbitrary(value)) {
    return fromArbitrary(value);
  }

  return /^\d+$/.test(value) ? `repeat(${value}, minmax(0, 1fr))` : '';
}

/** Утилиты, у которых значение зашито в само имя класса */
const staticUtilities: Record<string, CssDeclarations> = {
  // как ведёт себя блок
  block: {display: 'block'},
  'inline-block': {display: 'inline-block'},
  inline: {display: 'inline'},
  flex: {display: 'flex'},
  'inline-flex': {display: 'inline-flex'},
  grid: {display: 'grid'},
  'inline-grid': {display: 'inline-grid'},
  hidden: {display: 'none'},

  // как блок стоит на странице
  static: {position: 'static'},
  relative: {position: 'relative'},
  absolute: {position: 'absolute'},
  fixed: {position: 'fixed'},
  sticky: {position: 'sticky'},

  // ряд и его дети
  'flex-row': {'flex-direction': 'row'},
  'flex-row-reverse': {'flex-direction': 'row-reverse'},
  'flex-col': {'flex-direction': 'column'},
  'flex-col-reverse': {'flex-direction': 'column-reverse'},
  'flex-wrap': {'flex-wrap': 'wrap'},
  'flex-wrap-reverse': {'flex-wrap': 'wrap-reverse'},
  'flex-nowrap': {'flex-wrap': 'nowrap'},
  'flex-1': {flex: '1 1 0%'},
  'flex-auto': {flex: '1 1 auto'},
  'flex-initial': {flex: '0 1 auto'},
  'flex-none': {flex: 'none'},
  grow: {'flex-grow': '1'},
  'grow-0': {'flex-grow': '0'},
  shrink: {'flex-shrink': '1'},
  'shrink-0': {'flex-shrink': '0'},
  'justify-start': {'justify-content': 'flex-start'},
  'justify-end': {'justify-content': 'flex-end'},
  'justify-center': {'justify-content': 'center'},
  'justify-between': {'justify-content': 'space-between'},
  'justify-around': {'justify-content': 'space-around'},
  'justify-evenly': {'justify-content': 'space-evenly'},
  'items-start': {'align-items': 'flex-start'},
  'items-end': {'align-items': 'flex-end'},
  'items-center': {'align-items': 'center'},
  'items-baseline': {'align-items': 'baseline'},
  'items-stretch': {'align-items': 'stretch'},
  'self-auto': {'align-self': 'auto'},
  'self-start': {'align-self': 'flex-start'},
  'self-end': {'align-self': 'flex-end'},
  'self-center': {'align-self': 'center'},
  'self-stretch': {'align-self': 'stretch'},
  'mx-auto': {'margin-left': 'auto', 'margin-right': 'auto'},

  // текст
  'text-left': {'text-align': 'left'},
  'text-center': {'text-align': 'center'},
  'text-right': {'text-align': 'right'},
  'text-justify': {'text-align': 'justify'},
  uppercase: {'text-transform': 'uppercase'},
  lowercase: {'text-transform': 'lowercase'},
  capitalize: {'text-transform': 'capitalize'},
  'normal-case': {'text-transform': 'none'},
  italic: {'font-style': 'italic'},
  'not-italic': {'font-style': 'normal'},
  underline: {'text-decoration': 'underline'},
  'line-through': {'text-decoration': 'line-through'},
  'no-underline': {'text-decoration': 'none'},
  truncate: {overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap'},

  // рамка: tailwind сам задаёт сплошной стиль, иначе рамки не видно
  border: {'border-width': '1px', 'border-style': 'solid'},
  'border-t': {'border-top-width': '1px', 'border-top-style': 'solid'},
  'border-r': {'border-right-width': '1px', 'border-right-style': 'solid'},
  'border-b': {'border-bottom-width': '1px', 'border-bottom-style': 'solid'},
  'border-l': {'border-left-width': '1px', 'border-left-style': 'solid'},
  rounded: {'border-radius': borderRadii.DEFAULT},
  shadow: {'box-shadow': boxShadows.DEFAULT},
};

/** Утилиты вида «префикс-значение» */
const valueUtilities: Record<string, (value: string) => CssDeclarations> = {
  // размеры
  w: (value) => toDeclarations(['width'], toSizeValue(value)),
  h: (value) => toDeclarations(['height'], toSizeValue(value, true)),
  'min-w': (value) => toDeclarations(['min-width'], toSizeValue(value)),
  'max-w': (value) => toDeclarations(['max-width'], toSizeValue(value)),
  'min-h': (value) => toDeclarations(['min-height'], toSizeValue(value, true)),
  'max-h': (value) => toDeclarations(['max-height'], toSizeValue(value, true)),
  basis: (value) => toDeclarations(['flex-basis'], toSizeValue(value)),

  // отступы внутри и снаружи
  p: (value) => toDeclarations(['padding'], toSizeValue(value)),
  px: (value) => toDeclarations(['padding-left', 'padding-right'], toSizeValue(value)),
  py: (value) => toDeclarations(['padding-top', 'padding-bottom'], toSizeValue(value, true)),
  pt: (value) => toDeclarations(['padding-top'], toSizeValue(value, true)),
  pr: (value) => toDeclarations(['padding-right'], toSizeValue(value)),
  pb: (value) => toDeclarations(['padding-bottom'], toSizeValue(value, true)),
  pl: (value) => toDeclarations(['padding-left'], toSizeValue(value)),
  m: (value) => toDeclarations(['margin'], toSizeValue(value)),
  mx: (value) => toDeclarations(['margin-left', 'margin-right'], toSizeValue(value)),
  my: (value) => toDeclarations(['margin-top', 'margin-bottom'], toSizeValue(value, true)),
  mt: (value) => toDeclarations(['margin-top'], toSizeValue(value, true)),
  mr: (value) => toDeclarations(['margin-right'], toSizeValue(value)),
  mb: (value) => toDeclarations(['margin-bottom'], toSizeValue(value, true)),
  ml: (value) => toDeclarations(['margin-left'], toSizeValue(value)),
  gap: (value) => toDeclarations(['gap'], toSizeValue(value)),
  'gap-x': (value) => toDeclarations(['column-gap'], toSizeValue(value)),
  'gap-y': (value) => toDeclarations(['row-gap'], toSizeValue(value, true)),

  // положение
  top: (value) => toDeclarations(['top'], toSizeValue(value, true)),
  right: (value) => toDeclarations(['right'], toSizeValue(value)),
  bottom: (value) => toDeclarations(['bottom'], toSizeValue(value, true)),
  left: (value) => toDeclarations(['left'], toSizeValue(value)),
  inset: (value) => toDeclarations(['inset'], toSizeValue(value)),
  z: (value) => toDeclarations(['z-index'], isArbitrary(value) ? fromArbitrary(value) : value),

  // сетка
  'grid-cols': (value) => toDeclarations(['grid-template-columns'], toGridTracks(value)),
  'grid-rows': (value) => toDeclarations(['grid-template-rows'], toGridTracks(value)),
  'col-span': (value) => toDeclarations(['grid-column'], /^\d+$/.test(value) ? `span ${value} / span ${value}` : ''),

  // текст: "text-[26px]" — размер, "text-[#3b2921]" и "text-white" — цвет
  text: (value) => {
    const color = toColorValue(value);

    return color
      ? {color}
      : toDeclarations(['font-size'], isArbitrary(value) ? fromArbitrary(value) : fontSizes[value] ?? '');
  },
  font: (value) => ({
    ...toDeclarations(['font-weight'], toScaleValue(fontWeights, value)),
    ...toDeclarations(['font-family'], fontFamilies[value] ?? ''),
  }),
  leading: (value) => toDeclarations(['line-height'], lineHeights[value] ?? toSizeValue(value, true)),
  tracking: (value) => toDeclarations(['letter-spacing'], toScaleValue(letterSpacings, value)),

  // фон и рамка
  bg: (value) => toDeclarations(['background-color'], toColorValue(value)),
  border: (value) => toBorderDeclarations(['border'], value),
  'border-t': (value) => toBorderDeclarations(['border-top'], value),
  'border-r': (value) => toBorderDeclarations(['border-right'], value),
  'border-b': (value) => toBorderDeclarations(['border-bottom'], value),
  'border-l': (value) => toBorderDeclarations(['border-left'], value),
  'border-x': (value) => toBorderDeclarations(['border-left', 'border-right'], value),
  'border-y': (value) => toBorderDeclarations(['border-top', 'border-bottom'], value),
  rounded: (value) => toDeclarations(['border-radius'], toScaleValue(borderRadii, value)),
  'rounded-t': (value) => toDeclarations(['border-top-left-radius', 'border-top-right-radius'], toScaleValue(borderRadii, value)),
  'rounded-b': (value) => toDeclarations(['border-bottom-left-radius', 'border-bottom-right-radius'], toScaleValue(borderRadii, value)),
  'rounded-l': (value) => toDeclarations(['border-top-left-radius', 'border-bottom-left-radius'], toScaleValue(borderRadii, value)),
  'rounded-r': (value) => toDeclarations(['border-top-right-radius', 'border-bottom-right-radius'], toScaleValue(borderRadii, value)),

  // эффекты
  shadow: (value) => toDeclarations(['box-shadow'], toScaleValue(boxShadows, value)),
  opacity: (value) => toDeclarations(
    ['opacity'],
    isArbitrary(value) ? fromArbitrary(value) : (isNumber(value) ? String(Number(value) / 100) : '')
  ),
  cursor: (value) => toDeclarations(['cursor'], isArbitrary(value) ? fromArbitrary(value) : value),
  overflow: (value) => toDeclarations(['overflow'], value),
  'overflow-x': (value) => toDeclarations(['overflow-x'], value),
  'overflow-y': (value) => toDeclarations(['overflow-y'], value),
  whitespace: (value) => toDeclarations(['white-space'], value),
};

/** Длинные префиксы проверяются первыми, иначе "border-t-2" разберётся как "border" */
const utilityPrefixes = Object.keys(valueUtilities).sort((a, b) => b.length - a.length);

/** Переводит один класс в css-свойства; незнакомый класс даёт пустой объект */
export const cssFromClassName = (className: string): CssDeclarations => {
  // произвольное свойство: "[grid-template-columns:1fr_2fr]" — годится любое имя
  const arbitraryProperty = className.match(/^\[([\w-]+):(.+)]$/);

  if (arbitraryProperty) {
    const [, cssProperty, value] = arbitraryProperty;
    return {[cssProperty]: value.replace(/_/g, ' ').trim()};
  }

  if (staticUtilities[className]) {
    return staticUtilities[className];
  }

  const prefix = utilityPrefixes.find((name) => className.startsWith(`${name}-`));

  return prefix ? valueUtilities[prefix](className.slice(prefix.length + 1)) : {};
}

/**
 * Разбирает весь атрибут class по вариантам: "md:flex" уходит в 'md', класс без
 * префикса — в 'base'. Незнакомые классы и префиксы состояний ("hover:", "dark:")
 * пропускаются: применить их всегда было бы неправильно.
 */
export const stylesFromClasses = (classAttr: string): Partial<Record<StyleVariant, CssDeclarations>> => {
  const styles: Partial<Record<StyleVariant, CssDeclarations>> = {};

  classAttr.split(' ').filter(Boolean).forEach((className) => {
    const [prefix, ...rest] = className.split(':');
    const variant = rest.length ? prefix as StyleVariant : 'base';

    if (rest.length > 1 || !styleVariants.includes(variant)) {
      return;
    }

    const declarations = cssFromClassName(rest.length ? rest.join(':') : className);

    if (Object.keys(declarations).length) {
      styles[variant] = {...styles[variant], ...declarations};
    }
  });

  return styles;
}
