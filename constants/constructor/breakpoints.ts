import type {StyleVariant} from "~/types/constructor";

export interface IBreakpoint {
  name: StyleVariant;
  title: string;
  /** С какой ширины окна вариант включается; 0 — работает всегда */
  minWidth: number;
  /** Ширина холста, на которой удобно править этот вариант */
  canvasWidth: number;
}

/**
 * Контрольные точки как в tailwind: вариант работает от своей ширины и шире,
 * поэтому порядок в массиве — это и порядок наложения стилей.
 * Самый узкий вариант ('base') включается от нуля — он и есть общие стили страницы.
 */
export const breakpoints: readonly IBreakpoint[] = [
  {name: 'base', title: 'Телефон', minWidth: 0, canvasWidth: 390},
  {name: 'sm', title: 'Большой телефон', minWidth: 640, canvasWidth: 640},
  {name: 'md', title: 'Планшет', minWidth: 768, canvasWidth: 768},
  {name: 'lg', title: 'Ноутбук', minWidth: 1024, canvasWidth: 1024},
  {name: 'xl', title: 'Монитор', minWidth: 1280, canvasWidth: 1280},
  {name: '2xl', title: 'Широкий экран', minWidth: 1536, canvasWidth: 1536},
];

export const styleVariants = breakpoints.map((breakpoint) => breakpoint.name);

export const getBreakpoint = (variant: StyleVariant) => {
  return breakpoints.find((breakpoint) => breakpoint.name === variant) ?? breakpoints[0];
}
