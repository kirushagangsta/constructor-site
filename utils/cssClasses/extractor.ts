import {cssMeasureUnits, cssProperties} from "~/constants/cssProperties";
import type {ICssClassData, ICssProperty} from "~/types/cssClasses";
import type {CssDeclarations} from "~/types/constructor";

/** Единицы проверяются от длинных к коротким, иначе "rem" распознается как "em" */
const measureUnitsByLength = [...cssMeasureUnits].sort((a, b) => b.length - a.length);

/** Свойства, которые в чужой вёрстке называются иначе, чем в конструкторе */
const stylePropertyAliases: Record<string, string> = {
  'background-color': 'background',
  'text-decoration-line': 'text-decoration',
};

const isNumeric = (value: string) => /^-?\d*\.?\d+$/.test(value.trim());

const toKebabCase = (value: string) => value.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();

/** Палитра понимает только #rrggbb, поэтому короткий hex и rgb() переводим к нему */
const toHexColor = (value: string) => {
  const shortHex = value.match(/^#([\da-f])([\da-f])([\da-f])$/i);

  if (shortHex) {
    return `#${shortHex.slice(1).map((part) => part + part).join('')}`.toLowerCase();
  }

  const rgb = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);

  if (rgb) {
    return `#${rgb.slice(1).map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`;
  }

  return value;
}

/**
 * Приводит набор стилей к именам, которые понимает конструктор:
 * в чужом json ключи бывают в camelCase и под другими именами.
 */
export const normalizeStyle = (style: CssDeclarations = {}): CssDeclarations => {
  return Object.fromEntries(
    Object.entries(style).map(([name, value]) => {
      const cssProperty = toKebabCase(name.trim());
      return [stylePropertyAliases[cssProperty] ?? cssProperty, value];
    })
  );
}

/** Делит значение на число и единицу измерения: "100px" → { classValue: "100", measureUnit: "px" } */
const parsePropertyValue = (property: ICssProperty, value: string): ICssClassData => {
  const isLength = property.control === 'length';
  // единицу отрезаем только от числа, иначе развалится что-нибудь вроде calc(100% - 10px)
  const foundUnit = isLength
    ? measureUnitsByLength.find((unit) => value.endsWith(unit) && isNumeric(value.slice(0, -unit.length)))
    : undefined;
  // если единицу не написали явно (например "auto"), в выпадашке показываем единицу по умолчанию
  const measureUnit = foundUnit ?? (isLength ? property.defaultUnit : undefined);

  const classValue = foundUnit ? value.slice(0, -foundUnit.length) : value;

  return {
    cssProperty: property.name,
    classValue: property.control === 'color' ? toHexColor(classValue) : classValue,
    ...(measureUnit ? {measureUnit} : {})
  };
}

/** Значения свойства по умолчанию — когда у блока такого стиля нет */
const getDefaultClassData = (property: ICssProperty): ICssClassData => ({
  cssProperty: property.name,
  classValue: property.defaultValue,
  ...(property.defaultUnit ? {measureUnit: property.defaultUnit} : {})
})

/** Разбирает стили блока в значения полей тулбара */
export const extractPropertyValues = (declarations: CssDeclarations = {}): ICssClassData[] => {
  return cssProperties.map((property) => {
    const value = declarations[property.name]?.trim();
    return value ? parsePropertyValue(property, value) : getDefaultClassData(property);
  })
}
