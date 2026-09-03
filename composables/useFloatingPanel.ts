import type {Ref} from "vue";

interface IFloatingPanelOptions {
  /** Отступ сверху; по горизонтали панель прижата либо к левому краю, либо к правому */
  top: number;
  left?: Nullable<number>;
  right?: Nullable<number>;
  width: number;
  minWidth?: number;
  minHeight?: number;
  /** Ключ, под которым положение и размер запоминаются в localStorage */
  storageKey: string;
}

interface IPanelState {
  top: number;
  left: Nullable<number>;
  right: Nullable<number>;
  width: number;
  height: Nullable<number>;
}

/** Сколько панели остаётся видно, как далеко её ни утащи */
const VISIBLE_EDGE = 80;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** localStorage может быть недоступен (приватный режим), поэтому все обращения защищены */
const readPanelState = (storageKey: string): Nullable<IPanelState> => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    return saved && isNumber(saved.top) && isNumber(saved.width) ? saved : null;
  } catch {
    return null;
  }
}

const writePanelState = (storageKey: string, state: IPanelState) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // не смогли сохранить — не страшно, панель просто вернётся на место по умолчанию
  }
}

/**
 * Плавающая панель: перетаскивается за шапку, меняет размер за уголок
 * и помнит своё положение между заходами.
 */
export const useFloatingPanel = (panel: Readonly<Ref<Nullable<HTMLElement>>>, options: IFloatingPanelOptions) => {
  const minWidth = options.minWidth ?? 200;
  const minHeight = options.minHeight ?? 120;

  const position = reactive({
    top: options.top,
    left: options.left ?? null as Nullable<number>,
    right: options.right ?? null as Nullable<number>,
  });
  const size = reactive({
    width: options.width,
    height: null as Nullable<number>,
  });

  const isDragging = ref(false);
  const isResizing = ref(false);

  const panelStyle = computed(() => ({
    top: `${position.top}px`,
    ...(position.left !== null ? {left: `${position.left}px`} : {}),
    ...(position.right !== null ? {right: `${position.right}px`} : {}),
    width: `${size.width}px`,
    // пока высоту не меняли руками, панель растёт по содержимому, но не выше экрана
    ...(size.height !== null ? {height: `${size.height}px`} : {maxHeight: 'calc(100vh - 32px)'}),
  }));

  const savePanelState = () => writePanelState(options.storageKey, {...position, ...size});

  /** Сохранённое положение подрезаем под текущее окно: панель могли утащить на большом экране */
  const restorePanelState = () => {
    const saved = readPanelState(options.storageKey);

    if (!saved) {
      return;
    }

    size.width = Math.max(minWidth, saved.width);
    size.height = isNumber(saved.height) ? Math.max(minHeight, saved.height) : null;
    position.top = clamp(saved.top, 0, window.innerHeight - VISIBLE_EDGE);
    position.right = isNumber(saved.right) ? saved.right : null;
    position.left = isNumber(saved.left)
      ? clamp(saved.left, VISIBLE_EDGE - size.width, window.innerWidth - VISIBLE_EDGE)
      : null;
  }

  /** Возвращает панель туда, где она была при первом запуске */
  const resetPanelState = () => {
    position.top = options.top;
    position.left = options.left ?? null;
    position.right = options.right ?? null;
    size.width = options.width;
    size.height = null;

    try {
      localStorage.removeItem(options.storageKey);
    } catch {
      // нечего чистить
    }
  }

  /** Панель могла быть прижата к правому краю — переводим её в координаты от левого */
  const pinToLeft = () => {
    if (position.left === null && panel.value) {
      position.left = panel.value.getBoundingClientRect().left;
      position.right = null;
    }
  }

  const trackPointer = (onMove: (event: PointerEvent) => void, onEnd: () => void) => {
    const stop = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      onEnd();
      savePanelState();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }

  const startDrag = (event: PointerEvent) => {
    pinToLeft();
    isDragging.value = true;

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = position.left ?? 0;
    const startTop = position.top;

    trackPointer(
      (moveEvent) => {
        position.left = clamp(startLeft + moveEvent.clientX - startX, VISIBLE_EDGE - size.width, window.innerWidth - VISIBLE_EDGE);
        position.top = clamp(startTop + moveEvent.clientY - startY, 0, window.innerHeight - VISIBLE_EDGE);
      },
      () => isDragging.value = false
    );
  }

  const startResize = (event: PointerEvent) => {
    pinToLeft();
    isResizing.value = true;

    const startX = event.clientX;
    const startY = event.clientY;
    const {width: startWidth, height: startHeight} = panel.value!.getBoundingClientRect();

    trackPointer(
      (moveEvent) => {
        size.width = Math.max(minWidth, startWidth + moveEvent.clientX - startX);
        size.height = Math.max(minHeight, startHeight + moveEvent.clientY - startY);
      },
      () => isResizing.value = false
    );
  }

  onMounted(restorePanelState);

  return {
    position,
    size,
    panelStyle,
    isDragging,
    isResizing,
    startDrag,
    startResize,
    resetPanelState
  };
}
