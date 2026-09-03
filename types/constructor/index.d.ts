/** Набор css-свойств: «имя свойства → значение» */
export type CssDeclarations = Record<string, string>;

/**
 * Вариант оформления: 'base' — общий для всех экранов, остальные включаются
 * от своей ширины и шире, как контрольные точки tailwind.
 */
export type StyleVariant = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IHtmlNode {
  id: string;
  tag: string;
  /** Стили узла как данные — из них генерируется css страницы */
  styles: Partial<Record<StyleVariant, CssDeclarations>>;
  /**
   * Атрибуты вёрстки как есть: class, href, id и прочее.
   * Редактор их не трогает и на холст не выводит — они нужны готовой странице.
   */
  attrs: Record<string, string>;
  children: Array<IHtmlNode | string>;
}
