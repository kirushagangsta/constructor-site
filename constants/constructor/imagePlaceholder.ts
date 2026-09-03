/**
 * Пустой <img> браузер не показывает совсем, поэтому картинка без файла
 * рисуется на холсте заглушкой — иначе такой блок нельзя было бы ни увидеть,
 * ни выбрать, чтобы загрузить в него файл.
 */
const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect x="1" y="1" width="318" height="178" rx="12" fill="#fff0f6" stroke="#ffd6e6" stroke-width="2" stroke-dasharray="8 6"/>
  <circle cx="118" cy="66" r="13" fill="#ffdcea"/>
  <path d="M92 126l36-42 27 31 21-23 50 34z" fill="#ffdcea"/>
</svg>`;

export const emptyImageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(placeholder)}`;
