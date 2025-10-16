import type {CssMeasureUnit, ICssProperty} from "~/types/cssClasses";

export enum CssClassesTailwind {
  padding = 'p'
}

export const cssProperties = [
  {
    name: 'padding',
    tailwindClassPrefix: 'p',
    defaultValue: '0',
    defaultUnit: 'px'
  }
] as ICssProperty[];

export const cssMeasureUnits = ['px'] as CssMeasureUnit[];