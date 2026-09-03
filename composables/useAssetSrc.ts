import {getAssetId, IMAGES_DIR_NAME, isAssetSrc} from "~/utils/constructor/assets";

/** Куда собирают страницу — от этого и зависит, во что развернётся ссылка на файл */
export type AssetTarget = 'editor' | 'preview' | 'archive';

/**
 * Единственное место, где id файла превращается в адрес. Всё, что показывает
 * страницу, берёт резолвер под свою цель — само про адреса файлов не знает
 * ничего. Значение не наше — возвращаем как есть: в чужом json ссылки свои.
 */
export const useAssetSrc = () => {
  const config = useRuntimeConfig();
  const {$api} = useNuxtApp();

  return (target: AssetTarget) => (value?: string) => {
    if (!isAssetSrc(value)) {
      return value ?? '';
    }

    const id = getAssetId(value!);

    // в архиве страница лежит рядом со своей папкой файлов — путь относительный
    if (target === 'archive') {
      return `${IMAGES_DIR_NAME}/${id}`;
    }

    // холст и превью живут по своим адресам, поэтому им нужен полный путь
    // до файла на сервере; сейчас он у них общий, но цели разные не зря —
    // превью, например, однажды может файлы вшивать
    const {user, project} = $api.fileManager.owner;

    return `${config.public.apiUrl}/assets/${user}/${project}/${id}`;
  }
}
