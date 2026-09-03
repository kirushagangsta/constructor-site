/** Где блок стоит и какой он ширины — в системе координат своего предка */
export interface IPlacement {
  left: number;
  top: number;
  width: number;
}

/**
 * Создаёт ли элемент систему координат для свободных детей. Это не только
 * position: контейнер создают ещё transform, filter, perspective и contain —
 * если не проверить их, редактор добавил бы родителю лишний position: relative.
 */
export const isPositioned = (element: HTMLElement) => {
  const {position, transform, filter, perspective, contain} = getComputedStyle(element);

  return position !== 'static'
    || transform !== 'none'
    || filter !== 'none'
    || perspective !== 'none'
    || /paint|layout|strict|content/.test(contain);
}

/**
 * Отступ, заданный словом auto, у свободного блока просто исчезает — им браузер
 * центрует блок в потоке. Поэтому в расчёт его брать нельзя, а обычный «getComputedStyle»
 * этого не покажет: он уже посчитал, во сколько пикселей auto превратился.
 */
const getMargin = (element: HTMLElement, property: 'margin-left' | 'margin-top', used: string) => {
  const computed = element.computedStyleMap?.().get(property);

  return computed?.toString() === 'auto' ? 0 : parseFloat(used);
}

/**
 * Место блока относительно предка, от которого будут считаться его координаты.
 * Считаем от padding-box предка и без собственных отступов блока: left и top
 * ставят именно внешний край блока относительно этого угла.
 */
export const getPlacement = (element: HTMLElement, ancestor: HTMLElement): IPlacement => {
  const rect = element.getBoundingClientRect();
  const base = ancestor.getBoundingClientRect();
  const {borderLeftWidth, borderTopWidth} = getComputedStyle(ancestor);
  const {marginLeft, marginTop} = getComputedStyle(element);

  return {
    left: Math.round(rect.left - base.left - parseFloat(borderLeftWidth) - getMargin(element, 'margin-left', marginLeft) + ancestor.scrollLeft),
    top: Math.round(rect.top - base.top - parseFloat(borderTopWidth) - getMargin(element, 'margin-top', marginTop) + ancestor.scrollTop),
    // страница живёт с box-sizing: border-box, поэтому измеренная ширина — та же, что в стилях
    width: Math.round(rect.width),
  };
}
