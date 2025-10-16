export type CssPropertyName = "padding" | "margin" | "width" | "height" | "background";
export type TailwindClassPrefix = "p" | "m" | "w" | "h" | "bg";
export type CssMeasureUnit = "px";

export type FormattedClassData = Record<CssPropertyName, {
  value: string;
  measureUnit?: CssMeasureUnit;
}>;

export interface ICssProperty {
  name: CssPropertyName;
  tailwindClassPrefix: TailwindClassPrefix,
  defaultValue: string;
  defaultUnit?: CssMeasureUnit;
  defaultWithoutUnit?: boolean;
}

export interface ICssClassData {
  cssProperty: CssPropertyName,
  tailwindClassPrefix: TailwindClassPrefix,
  classValue: string,
  measureUnit?: CssMeasureUnit,
}