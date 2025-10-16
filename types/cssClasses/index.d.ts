export type CssPropertyName = "padding";
export type TailwindClassPrefix = "p";
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
}

export interface ICssClassData {
  cssProperty: CssPropertyName,
  tailwindClassPrefix: TailwindClassPrefix,
  classValue: string,
  measureUnit?: CssMeasureUnit,
}