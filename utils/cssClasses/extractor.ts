import {cssMeasureUnits, cssProperties} from "~/constants/tailwindClasses";
import {CssClassesTailwind} from "@/constants/tailwindClasses";
import type {ICssClassData, CssPropertyName, TailwindClassPrefix, ICssProperty} from "~/types/cssClasses";

export const getClassByProperty = (classAttrValue: string, type: CssPropertyName) => {
  return classAttrValue.split(" ")
    .find(el => el.split("-")[0] === CssClassesTailwind[type]) ?? ""
}

export const extractClasses = (classAttr: string) => {
  return cssProperties
    .reduce((out, el: ICssProperty) => {
      const twClass = getClassByProperty(classAttr, el.name);
      if (twClass) {
        const splittedClass = twClass.split("-");
        const tailwindClassPrefix = splittedClass[0] as TailwindClassPrefix;
        const tailwindClassValue = splittedClass.slice(1).join('').replace('[', '').replace(']', '');
        const measureUnit = cssMeasureUnits.find(el => tailwindClassValue.endsWith(el));
        const regex = new RegExp(`${measureUnit}$`);
        const classValue = measureUnit ? tailwindClassValue.replace(regex, '') : tailwindClassValue;
        out.push({
          cssProperty: el.name,
          tailwindClassPrefix,
          classValue,
          ...(measureUnit ? { measureUnit } : {})
        });
      } else {
        out.push({
          cssProperty: el.name,
          tailwindClassPrefix: el.tailwindClassPrefix,
          classValue: el.defaultValue,
          ...(el.defaultUnit ? { measureUnit: el.defaultUnit } : {})
        })
      }
      return out;
  }, [] as ICssClassData[])
}