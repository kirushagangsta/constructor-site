import type {CssMeasureUnit, ICssProperty} from "~/types/cssClasses";

export enum CssClassesTailwind {
  padding = 'p',
  width = 'w'
}

export const cssProperties = [
  {
    name: 'padding',
    tailwindClassPrefix: 'p',
    defaultValue: '0',
    defaultUnit: 'px'
  },
  {
    name: 'width',
    tailwindClassPrefix: 'w',
    defaultValue: 'auto',
    defaultUnit: 'px'
  }
] as ICssProperty[];

export const cssMeasureUnits = ['px'] as CssMeasureUnit[];