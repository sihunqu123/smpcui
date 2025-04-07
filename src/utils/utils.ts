/* eslint-disable @typescript-eslint/no-unused-vars */
import { customAlphabet } from 'nanoid';
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel, EffectivePreferenceModel,
} from '../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

const generateNanoid = (length: number = 21): string => {
  const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
  return customAlphabet(CHARSET, length)();
};

/*
 * 0: debug;
 * 1: info;
 * 2: warn;
 * 3: error;
 */
let logLevel: Number = 0;

/* eslint-disable no-console */
const LogUtil = {
  debug: (msg) => {
    if (logLevel <= 0) console.debug(msg);
  },
  info: (msg) => {
    if (logLevel <= 1) console.info(msg);
  },
  warn: (msg) => {
    if (logLevel <= 2) console.warn(msg);
  },
  error: (msg) => {
    if (logLevel <= 3) console.error(msg);
  },
};

const getFromWPS = (key: string): string => {
  const retVal = window.eval(`window.fromWPS && window.fromWPS.${key}`);
  LogUtil.debug(`getFromWPS key: ${key}, value: ${retVal}`);
  return retVal;
  // Will result to build error
  // return window.fromWPS! && window.fromWPS[key];
};

const tmpVal = getFromWPS('logLevel');
try {
  const logLevelFromEnv: Number = parseInt(tmpVal, 10);
  logLevel = logLevelFromEnv;
  console.warn(`logLevelFromEnv: ${logLevelFromEnv}`);
} catch (e) {
  console.error(`get logLevelFromEnv failed: ${tmpVal}`);
  console.error(e);
}
/* eslint-enable no-console */
const isDebug = logLevel === 0;

const getURL = (): string => window.location.href;

/* eslint-disable no-param-reassign */
const customizePaginatorTxt = (matPaginatorIntl: MatPaginatorIntl): void => {
  // 設定顯示筆數資訊文字
  matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `第 0 页、共 ${length} 页`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    // return `第 ${startIndex + 1} - ${endIndex} 条、共 ${length} 条`;
    return `第 ${startIndex + 1} - ${endIndex} 条(第 ${page + 1} 页)、共 ${length} 条`;
    // return `第 ${page + 1} 条、共 ${length} 条`;
  };

  // 設定其他顯示資訊文字
  matPaginatorIntl.itemsPerPageLabel = '每页条数：';
  matPaginatorIntl.nextPageLabel = '下一页';
  matPaginatorIntl.previousPageLabel = '上一页';
  matPaginatorIntl.firstPageLabel = '第一页';
  matPaginatorIntl.lastPageLabel = '最后一页';
};
/* eslint-enable no-param-reassign */

const collectATEntry = (entry: any): AuthoringTemplateModel[] => {
  const items: AuthoringTemplateModel[] = entry.map((item:any) => {
    const {
      id, title, updated, name,
    } = item;
    return {
      itemId: id.split(':')[1],
      title: title?.value,
      updated,
      name,
    };
  });
  return items;
};

const moveElement = (arr: any[], element, action: string): any[] => {
  // const result = arr.concat();
  let result = [];
  if (action === 'add') {
    // add the new elements
    result = result.concat(arr).concat(element);
    return result;
  }
  const i = arr.indexOf(element);
  if (i < 0) {
    return arr;
  }
  const rightIndex = i + 1;
  switch (action) {
    case 'top':
      // add element itself
      result = result.concat(element);
      // add left side
      result = result.concat(arr.slice(0, i));
      result = result.concat(arr.slice(i + 1));
      break;
    case 'up': {
      const leftIndex = i - 1;
      // add left side
      if (leftIndex >= 0) {
        result = result.concat(arr.slice(0, leftIndex));
      }
      // add element itself
      result = result.concat(element);
      // add the left one element
      if (leftIndex >= 0) {
        result = result.concat(arr[leftIndex]);
      }
      // add the right side
      result = result.concat(arr.slice(i + 1));
      break;
    }
    case 'down':
      // add left side
      result = result.concat(arr.slice(0, i));
      // add the right one element
      if (rightIndex < arr.length) {
        result = result.concat(arr[rightIndex]);
      }
      // add element itself
      result = result.concat(element);
      // add the right side
      result = result.concat(arr.slice(i + 2));
      break;
    case 'bottom':
      // add left side
      result = result.concat(arr.slice(0, i));
      // add the right side
      result = result.concat(arr.slice(i + 1));
      // add element itself
      result = result.concat(element);
      break;
    case 'delete':
      // add left side
      result = result.concat(arr.slice(0, i));
      // add the right side
      result = result.concat(arr.slice(i + 1));
      break;
    default:
      LogUtil.error('no match moveElement type!');
      return arr;
  }
  return result;
};

const propertyFields: any = {
  name: '属性',
  items: [
    { value: 'property:name', viewValue: 'name(英文名称)', type: 'text' },
    { value: 'property:title', viewValue: 'title(中文标题)', type: 'text' },
    //    { value: 'property:summary', viewValue:'summary', type: 'text' },
  ],
};

const translateType: Function = (type) => {
  switch (type) {
    case 'RichTextComponent':
      return '富文本';
    case 'ImageComponent':
      return '图片';
    case 'FileComponent':
      return '视频';
    case 'LinkComponent':
      return '链接';
    case 'TextComponent':
      return '纯文本';
    case 'ShortTextComponent':
      return '短纯文本';
    case 'OptionSelectionComponent':
      return '选项';
    default:
      return type;
  }
};

const toChineseDateFormat: Function = (str) => {
  if (!str) {
    return str;
  }
  let newStr = null;
  try {
    newStr = new Date(str.substr(0, str.indexOf('.') || 99)).toISOString().replace('T', ' ').replace(/\..+/, '');
  } catch (e) {
    newStr = str;
    LogUtil.warn(`toChineseDateFormat failed:${e.message}`);
  }
  return newStr;
};

const getImgMeta = async (url) => {
  const img = new Image();
  return new Promise((resolve) => {
    img.onload = () => {
      const retVal = {
        width: img.width,
        height: img.height,
      };
      LogUtil.debug(`getImgMeta rest: ${JSON.stringify(retVal)}`);
      resolve(retVal);
    };
    img.src = url;
  });
};

export {
  isDebug,
  LogUtil,
  getFromWPS,
  generateNanoid,
  customizePaginatorTxt,
  collectATEntry,
  moveElement,
  getURL,
  propertyFields,
  translateType,
  toChineseDateFormat,
  getImgMeta,
};
