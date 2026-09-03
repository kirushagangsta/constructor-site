import type {Ref} from "vue";
import type {IHtmlNode} from "~/types/constructor";
import {describeChange} from "~/utils/constructor/history";

export interface IHistoryEntry {
  /** Свой номер: по нему журнал находит запись, к которой возвращают страницу */
  id: number;
  /** Что сделали — человеческим языком */
  title: string;
  time: string;
  /** Страница до этого действия, снимком в json */
  before: string;
}

/** Сколько шагов помним */
const HISTORY_LIMIT = 100;

/**
 * Сколько памяти отдаём под снимки страницы, в символах json.
 * У маленькой страницы помещается весь журнал, у большой — столько шагов,
 * сколько влезает.
 */
const HISTORY_MEMORY = 8_000_000;

/** Правки об одном и том же подряд считаются одним действием */
const MERGE_TIMEOUT = 800;

const formatTime = (time: number) => {
  return new Date(time).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
}

/**
 * Журнал действий и отмена. Дерево страницы — обычные данные, поэтому история
 * хранится снимками в json: снимок ничего не знает о реактивности, сравнивается
 * строкой и разворачивается обратно в страницу.
 *
 * Пишется всё, что меняет дерево, откуда бы правка ни пришла — с холста,
 * из панели блока или из импорта.
 */
export const usePageHistory = (page: Ref<IHtmlNode>) => {
  const entries = ref<IHistoryEntry[]>([]);

  /** Страница такой, какой её запомнило последнее записанное действие */
  let snapshot = JSON.stringify(page.value);
  let lastRecordTime = 0;
  let lastEntryId = 0;
  /** Название следующего действия, если тот, кто его делает, знает его лучше */
  let nextTitle = '';

  /** Журнал помнит не всё: про забытые шаги честно говорим в панели */
  const isTrimmed = ref(false);

  const canUndo = computed(() => !!entries.value.length);

  /**
   * Самые старые шаги забываются, когда их слишком много или когда снимки
   * заняли слишком много памяти. Один шаг остаётся всегда: страница может
   * быть тяжелее всего бюджета, а отмена всё равно нужна.
   */
  const trimHistory = () => {
    let memory = entries.value.reduce((size, entry) => size + entry.before.length, 0);

    while (entries.value.length > 1 && (entries.value.length > HISTORY_LIMIT || memory > HISTORY_MEMORY)) {
      memory -= entries.value.pop()!.before.length;
      isTrimmed.value = true;
    }
  }

  /** Журнал начинается заново: страница пришла целиком, откатывать нечего */
  const reset = () => {
    entries.value = [];
    isTrimmed.value = false;
    snapshot = JSON.stringify(page.value);
    nextTitle = '';
  }

  /**
   * Назвать следующее действие своими словами. Вызвать можно и до правки,
   * и сразу после неё: журнал всё равно пишется после отрисовки.
   */
  const describe = (title: string) => {
    nextTitle = title;
  }

  const record = () => {
    const current = JSON.stringify(page.value);

    // страницу тронули, но она осталась прежней — записывать нечего
    if (current === snapshot) {
      return;
    }

    const title = nextTitle || describeChange(JSON.parse(snapshot), JSON.parse(current));
    const time = Date.now();
    const [last] = entries.value;

    nextTitle = '';

    // иначе журнал забивался бы каждой набранной буквой
    if (last && last.title === title && time - lastRecordTime < MERGE_TIMEOUT) {
      last.time = formatTime(time);
    } else {
      entries.value.unshift({id: ++lastEntryId, title, time: formatTime(time), before: snapshot});
      trimHistory();
    }

    lastRecordTime = time;
    snapshot = current;
  }

  /**
   * Отмена возвращает страницу к состоянию перед действием и возвращает его
   * название. Без номера отменяется последнее действие, с номером — ещё и всё,
   * что случилось после него.
   */
  const undo = (entryId?: number) => {
    const index = entryId === undefined ? 0 : entries.value.findIndex((entry) => entry.id === entryId);
    const entry = entries.value[index];

    if (!entry) {
      return '';
    }

    // снимок ставим до правки страницы: наблюдатель увидит, что она уже такая,
    // какой её запомнили, и отмена сама в журнал не попадёт
    snapshot = entry.before;
    page.value = reactive(JSON.parse(entry.before));
    entries.value = entries.value.slice(index + 1);

    return entry.title;
  }

  watch(page, record, {deep: true, flush: 'post'});

  return {entries, canUndo, isTrimmed, describe, reset, undo};
}
