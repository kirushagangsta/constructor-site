import type {CssMeasureUnit, ICssProperty} from "~/types/cssClasses";

export enum CssClassesTailwind {
  padding = 'p',
  width = 'w',
  height = 'h',
  margin = 'm',
  background = 'bg'
}

export const cssProperties = [
  {
    name: 'padding',
    tailwindClassPrefix: 'p',
    defaultValue: '0',
    defaultUnit: 'px'
  },
  {
    name: 'margin',
    tailwindClassPrefix: 'm',
    defaultValue: '0',
    defaultUnit: 'px'
  },
  {
    name: 'width',
    tailwindClassPrefix: 'w',
    defaultValue: 'auto',
    defaultUnit: 'px',
    defaultWithoutUnit: true
  },
  {
    name: 'height',
    tailwindClassPrefix: 'h',
    defaultValue: 'auto',
    defaultUnit: 'px',
    defaultWithoutUnit: true
  },
  {
    name: 'background',
    tailwindClassPrefix: 'bg',
    defaultValue: '',
  }
] as ICssProperty[];

export const cssMeasureUnits = ['px'] as CssMeasureUnit[];