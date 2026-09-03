/**
 * Сброс базовых стилей браузера для готовой страницы.
 *
 * На холсте эту работу делает tailwind самого редактора, а превью и скачанный файл
 * живут без него — без сброса всплывают подчёркнутые ссылки, отступы у заголовков,
 * маркеры списков и прочие настройки браузера, которых в конструкторе не видно.
 * Повторяет ту часть preflight, на которую опираются наши стили.
 */
export const pageReset = `*,
*::before,
*::after {
  box-sizing: border-box;
  /* рамка появляется от одной толщины: стиль задан заранее, как в tailwind */
  border: 0 solid currentColor;
}

html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

body {
  margin: 0;
  line-height: inherit;
}

/* Заголовки и абзацы: размер и жирность задаёт конструктор, а не браузер */
h1, h2, h3, h4, h5, h6 {
  font-size: inherit;
  font-weight: inherit;
}

h1, h2, h3, h4, h5, h6,
p, figure, blockquote, dl, dd, pre {
  margin: 0;
}

ol, ul, menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Ссылки не подчёркиваются и не синеют — цвет и линию решает оформление блока */
a {
  color: inherit;
  text-decoration: inherit;
}

b, strong {
  font-weight: bolder;
}

code, kbd, samp, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1em;
}

small {
  font-size: 80%;
}

sub, sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

table {
  border-collapse: collapse;
  border-color: inherit;
  text-indent: 0;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

/* Поля и кнопки наследуют шрифт страницы, а не системный */
button, input, optgroup, select, textarea {
  font-family: inherit;
  font-size: 100%;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  margin: 0;
  padding: 0;
}

button, select {
  text-transform: none;
}

button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
  cursor: pointer;
}

::placeholder {
  opacity: 1;
  color: #9ca3af;
}

textarea {
  resize: vertical;
}

/* Картинки и видео ведут себя как блоки и не вылезают за родителя */
img, svg, video, canvas, audio, iframe, embed, object {
  display: block;
  vertical-align: middle;
}

img, video {
  max-width: 100%;
  height: auto;
}

[hidden] {
  display: none;
}`;
