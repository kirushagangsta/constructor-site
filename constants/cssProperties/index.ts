import type {CssMeasureUnit, ICssGroup, ICssOption, ICssProperty} from "~/types/cssClasses";

/** Единицы измерения, доступные в выпадашке рядом с числовыми полями */
export const cssMeasureUnits: readonly CssMeasureUnit[] = ['px', '%', 'rem', 'em', 'vh', 'vw'];

/** Секции тулбара; порядок групп задаёт порядок секций */
export const cssGroups: readonly ICssGroup[] = [
  {name: 'layout', title: 'Расположение', icon: '🧩'},
  {name: 'size', title: 'Размеры', icon: '📐'},
  {name: 'spacing', title: 'Отступы', icon: '🎀'},
  {name: 'typography', title: 'Текст', icon: '🖋️'},
  {name: 'border', title: 'Рамка', icon: '🌸'},
  {name: 'effects', title: 'Эффекты', icon: '✨'},
];

/** Часто повторяющиеся значения-слова */
const AUTO: ICssOption = {value: 'auto', label: 'само'};
const FIT_CONTENT: ICssOption = {value: 'fit-content', label: 'по содержимому'};
const NO_LIMIT: ICssOption = {value: 'none', label: 'без ограничения'};
const NORMAL: ICssOption = {value: 'normal', label: 'обычный'};

/**
 * Все свойства, которые умеет редактировать конструктор.
 * Чтобы добавить новое, достаточно дописать сюда строку.
 *
 * label — подпись для человека, name — имя css-свойства, оно же показывается
 * в тулбаре серой подсказкой для тех, кто знает css.
 *
 * tailwindClassPrefix задан только у пяти "исторических" свойств (класс вида "p-[10px]"),
 * остальные пишутся универсальным синтаксисом произвольного свойства: "[gap:10px]".
 */
export const cssProperties: readonly ICssProperty[] = [
  // Расположение
  {
    name: 'display', label: 'Как ведёт себя блок', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'block', label: 'обычный блок'},
      {value: 'inline-block', label: 'блок внутри строки'},
      {value: 'flex', label: 'выстраивает детей в ряд'},
      {value: 'inline-flex', label: 'ряд детей внутри строки'},
      {value: 'grid', label: 'сетка'},
      {value: 'none', label: 'спрятан'}
    ]
  },
  {
    name: 'flex-direction', label: 'Куда выстраиваются дети', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'row', label: 'в строку'},
      {value: 'row-reverse', label: 'в строку, справа налево'},
      {value: 'column', label: 'в столбик'},
      {value: 'column-reverse', label: 'в столбик, снизу вверх'}
    ]
  },
  {
    name: 'flex-wrap', label: 'Переносить детей на новую строку', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'nowrap', label: 'нет, сжимать в одну строку'},
      {value: 'wrap', label: 'да, переносить'},
      {value: 'wrap-reverse', label: 'да, переносить наверх'}
    ]
  },
  {
    name: 'justify-content', label: 'Расстановка детей вдоль ряда', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'flex-start', label: 'в начале'},
      {value: 'center', label: 'по центру'},
      {value: 'flex-end', label: 'в конце'},
      {value: 'space-between', label: 'по краям, промежутки поровну'},
      {value: 'space-around', label: 'с отступами вокруг каждого'},
      {value: 'space-evenly', label: 'с одинаковыми промежутками'}
    ]
  },
  {
    name: 'align-items', label: 'Расстановка детей поперёк ряда', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'stretch', label: 'растянуть на всю высоту'},
      {value: 'flex-start', label: 'прижать к началу'},
      {value: 'center', label: 'по центру'},
      {value: 'flex-end', label: 'прижать к концу'},
      {value: 'baseline', label: 'по линии текста'}
    ]
  },
  {name: 'gap', label: 'Промежуток между детьми', group: 'layout', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {
    name: 'position', label: 'Как блок стоит на странице', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'static', label: 'как обычно, в потоке'},
      {value: 'relative', label: 'со сдвигом от своего места'},
      {value: 'absolute', label: 'свободно внутри родителя'},
      {value: 'fixed', label: 'закреплён в окне'},
      {value: 'sticky', label: 'липнет при прокрутке'}
    ]
  },
  {name: 'top', label: 'Сдвиг сверху', group: 'layout', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'right', label: 'Сдвиг справа', group: 'layout', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'bottom', label: 'Сдвиг снизу', group: 'layout', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'left', label: 'Сдвиг слева', group: 'layout', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'z-index', label: 'Кто поверх кого (чем больше, тем выше)', group: 'layout', control: 'number', defaultValue: ''},
  {
    name: 'overflow', label: 'Если содержимое не помещается', group: 'layout', control: 'keyword', defaultValue: '',
    options: [
      {value: 'visible', label: 'вылезает наружу'},
      {value: 'hidden', label: 'обрезается'},
      {value: 'auto', label: 'появляется прокрутка'},
      {value: 'scroll', label: 'прокрутка всегда'}
    ]
  },

  // Размеры
  {
    name: 'width', label: 'Ширина', group: 'size', control: 'length', tailwindClassPrefix: 'w',
    defaultValue: 'auto', defaultUnit: 'px',
    keywords: [AUTO, FIT_CONTENT, {value: 'min-content', label: 'самая узкая'}, {value: 'max-content', label: 'самая широкая'}]
  },
  {
    name: 'height', label: 'Высота', group: 'size', control: 'length', tailwindClassPrefix: 'h',
    defaultValue: 'auto', defaultUnit: 'px',
    keywords: [AUTO, FIT_CONTENT, {value: 'min-content', label: 'самая низкая'}, {value: 'max-content', label: 'самая высокая'}]
  },
  {name: 'min-width', label: 'Уже быть не может', group: 'size', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO, FIT_CONTENT]},
  {name: 'max-width', label: 'Шире быть не может', group: 'size', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [NO_LIMIT, FIT_CONTENT]},
  {name: 'min-height', label: 'Ниже быть не может', group: 'size', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO, FIT_CONTENT]},
  {name: 'max-height', label: 'Выше быть не может', group: 'size', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [NO_LIMIT, FIT_CONTENT]},

  // Отступы
  {name: 'padding', label: 'Отступ внутри блока', group: 'spacing', control: 'length', tailwindClassPrefix: 'p', defaultValue: '0', defaultUnit: 'px'},
  {name: 'padding-top', label: 'Внутри сверху', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {name: 'padding-right', label: 'Внутри справа', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {name: 'padding-bottom', label: 'Внутри снизу', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {name: 'padding-left', label: 'Внутри слева', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {
    name: 'margin', label: 'Отступ снаружи блока', group: 'spacing', control: 'length', tailwindClassPrefix: 'm',
    defaultValue: '0', defaultUnit: 'px', keywords: [{value: 'auto', label: 'само (по центру)'}]
  },
  {name: 'margin-top', label: 'Снаружи сверху', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'margin-right', label: 'Снаружи справа', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'margin-bottom', label: 'Снаружи снизу', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},
  {name: 'margin-left', label: 'Снаружи слева', group: 'spacing', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [AUTO]},

  // Текст
  {name: 'color', label: 'Цвет текста', group: 'typography', control: 'color', defaultValue: ''},
  {name: 'font-family', label: 'Шрифт', group: 'typography', control: 'text', defaultValue: ''},
  {name: 'font-size', label: 'Размер текста', group: 'typography', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {
    name: 'font-weight', label: 'Толщина текста', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: '300', label: 'тонкий'},
      {value: '400', label: 'обычный'},
      {value: '500', label: 'чуть плотнее'},
      {value: '600', label: 'полужирный'},
      {value: '700', label: 'жирный'},
      {value: '800', label: 'очень жирный'}
    ]
  },
  {
    name: 'font-style', label: 'Наклон текста', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: 'normal', label: 'прямой'},
      {value: 'italic', label: 'курсив'}
    ]
  },
  {name: 'line-height', label: 'Высота строки', group: 'typography', control: 'length', defaultValue: '', keywords: [NORMAL]},
  {name: 'letter-spacing', label: 'Расстояние между буквами', group: 'typography', control: 'length', defaultValue: '', defaultUnit: 'px', keywords: [NORMAL]},
  {
    name: 'text-align', label: 'Выравнивание текста', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: 'left', label: 'слева'},
      {value: 'center', label: 'по центру'},
      {value: 'right', label: 'справа'},
      {value: 'justify', label: 'по ширине блока'}
    ]
  },
  {
    name: 'text-transform', label: 'Регистр букв', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: 'none', label: 'как написано'},
      {value: 'uppercase', label: 'ВСЕ ЗАГЛАВНЫЕ'},
      {value: 'lowercase', label: 'все строчные'},
      {value: 'capitalize', label: 'С Заглавной Каждое Слово'}
    ]
  },
  {
    name: 'text-decoration', label: 'Линия у текста', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: 'none', label: 'без линии'},
      {value: 'underline', label: 'подчёркнутый'},
      {value: 'line-through', label: 'зачёркнутый'}
    ]
  },
  {
    name: 'white-space', label: 'Переносы строк', group: 'typography', control: 'keyword', defaultValue: '',
    options: [
      {value: 'normal', label: 'переносить как обычно'},
      {value: 'nowrap', label: 'не переносить'},
      {value: 'pre-wrap', label: 'сохранять пробелы'},
      {value: 'pre-line', label: 'сохранять переносы'}
    ]
  },

  // Рамка
  {name: 'border-width', label: 'Толщина рамки', group: 'border', control: 'length', defaultValue: '', defaultUnit: 'px'},
  {
    name: 'border-style', label: 'Вид рамки', group: 'border', control: 'keyword', defaultValue: '',
    options: [
      {value: 'none', label: 'без рамки'},
      {value: 'solid', label: 'сплошная'},
      {value: 'dashed', label: 'пунктирная'},
      {value: 'dotted', label: 'точками'},
      {value: 'double', label: 'двойная'}
    ]
  },
  {name: 'border-color', label: 'Цвет рамки', group: 'border', control: 'color', defaultValue: ''},
  {name: 'border-radius', label: 'Скругление углов', group: 'border', control: 'length', defaultValue: '', defaultUnit: 'px'},

  // Эффекты
  {name: 'background', label: 'Цвет фона', group: 'effects', control: 'color', tailwindClassPrefix: 'bg', defaultValue: ''},
  {name: 'opacity', label: 'Прозрачность: 0 — не видно, 1 — видно', group: 'effects', control: 'number', defaultValue: ''},
  {name: 'box-shadow', label: 'Тень, например 0 4px 10px #ffb6d5', group: 'effects', control: 'text', defaultValue: ''},
  {name: 'transform', label: 'Поворот и масштаб, например rotate(5deg)', group: 'effects', control: 'text', defaultValue: ''},
  {
    name: 'cursor', label: 'Курсор при наведении', group: 'effects', control: 'keyword', defaultValue: '',
    options: [
      {value: 'auto', label: 'как обычно'},
      {value: 'pointer', label: 'рука, будто кликабельно'},
      {value: 'default', label: 'стрелка'},
      {value: 'text', label: 'для выделения текста'},
      {value: 'move', label: 'перетаскивание'},
      {value: 'not-allowed', label: 'нельзя нажать'}
    ]
  },
];

/** Свойства, разложенные по секциям тулбара */
export const cssPropertyGroups = cssGroups.map((group) => ({
  ...group,
  properties: cssProperties.filter((property) => property.group === group.name)
}));
