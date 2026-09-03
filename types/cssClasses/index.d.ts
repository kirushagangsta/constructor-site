export type CssMeasureUnit = "px" | "%" | "rem" | "em" | "vh" | "vw";

export type CssGroupName = "layout" | "size" | "spacing" | "typography" | "border" | "effects";

/** Каким контролом свойство редактируется в тулбаре */
export type CssControlType = "length" | "number" | "color" | "keyword" | "text";

/** Готовое значение css: label — понятная подпись, value — то, что уходит в стили */
export interface ICssOption {
  readonly value: string;
  readonly label: string;
}

export interface ICssProperty {
  /** Имя css-свойства, оно же ключ в атрибуте style и подсказка для разработчика */
  readonly name: string;
  /** Подпись поля человеческим языком */
  readonly label: string;
  readonly group: CssGroupName;
  readonly control: CssControlType;
  /** Короткий tailwind-префикс ("p" → "p-[10px]"). Без него класс пишется как "[gap:10px]" */
  readonly tailwindClassPrefix?: string;
  readonly defaultValue: string;
  readonly defaultUnit?: CssMeasureUnit;
  /** Варианты для control === "keyword" */
  readonly options?: readonly ICssOption[];
  /** Значения-слова (auto, fit-content...) — показываются переключателями рядом с числом */
  readonly keywords?: readonly ICssOption[];
}

export interface ICssGroup {
  readonly name: CssGroupName;
  readonly title: string;
  readonly icon: string;
}

/** Значение свойства, разобранное из класса блока */
export interface ICssClassData {
  cssProperty: string;
  classValue: string;
  measureUnit?: string;
}

/** Значения всех свойств блока, ключ — имя css-свойства */
export type FormattedClassData = Record<string, {
  value: string;
  measureUnit?: string;
}>;
