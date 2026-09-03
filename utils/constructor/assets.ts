/**
 * Ссылка на файл проекта внутри дерева страницы.
 *
 * В узле лежит id файла, а не путь до него: 'asset:<id>'. Путь у каждой цели
 * сборки свой — на холсте адрес сервера, в архиве соседняя папка, — поэтому
 * дерево не знает ни одного из них и не переписывается, когда они меняются.
 * Разворачивает id в адрес один резолвер: useAssetSrc.
 */
export const ASSET_SCHEME = 'asset:';

/** Наш файл, а не чужая ссылка из импортированного json */
export const isAssetSrc = (value?: string) => !!value?.startsWith(ASSET_SCHEME);

export const buildAssetSrc = (id: string) => `${ASSET_SCHEME}${id}`;

export const getAssetId = (value: string) => value.slice(ASSET_SCHEME.length);

/** Папка с файлами внутри архива — это уже про экспорт, а не про хранение */
export const IMAGES_DIR_NAME = 'images';

// раньше в дереве лежал путь, собранный под архив, — и его приходилось
// разворачивать обратно везде, где страницу показывали не из архива
const legacyPathPattern = /^images\/([\w-]{1,64}\.(?:png|jpg|webp|gif))$/;

/** Путь из старых страниц превращаем в ссылку на файл при разборе дерева */
export const normalizeAssetSrc = (value: string) => {
  const legacy = value.match(legacyPathPattern);

  return legacy ? buildAssetSrc(legacy[1]) : value;
}
