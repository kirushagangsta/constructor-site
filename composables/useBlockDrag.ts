import type {Ref} from "vue";
import {voidTags} from "~/constants/constructor/tags";
import type {IPlacement} from "~/utils/constructor/position";
import {getPlacement} from "~/utils/constructor/position";

/** Куда встанет блок: в какой родитель и каким по счёту среди его блоков */
export interface IDropTarget {
  parentId: string;
  index: number;
}

/** Подсказка на холсте: линия на месте вставки или рамка вокруг пустого родителя */
export interface IDropHint {
  left: number;
  top: number;
  width: number;
  height: number;
  isLine: boolean;
}

/** Пока курсор не увели на столько, это обычный клик, а не перетаскивание */
const DRAG_THRESHOLD = 4;

/** Насколько близко к краю блока нужно подойти, чтобы встать рядом с ним, а не внутрь */
const EDGE_RATIO = 0.25;
const EDGE_LIMIT = 14;

/** Толщина линии, которая показывает место вставки */
const LINE_SIZE = 3;

/** У края холста страница подкручивается сама */
const SCROLL_ZONE = 56;
const SCROLL_STEP = 12;

/** С зажатым shift свободный блок встаёт по сетке */
const SNAP_STEP = 8;

/** Свободный блок двигают за координаты, остальные — по дереву */
const isFreeBlock = (element: HTMLElement) => {
  const {position} = getComputedStyle(element);
  return position === 'absolute' || position === 'fixed';
}

const isBlock = (element: unknown): element is HTMLElement => {
  return element instanceof HTMLElement && element.hasAttribute('data-id');
}

/** Блоки-дети в том же порядке, в каком они лежат в дереве */
const getChildBlocks = (parent: HTMLElement) => [...parent.children].filter(isBlock);

/**
 * В строку стоят дети или в столбик — видно по ним самим: если сосед лежит сбоку,
 * значит, вставать надо слева или справа от блока. Так одинаково разбираются
 * и flex, и grid, и обычный поток, и перенос строк.
 */
const isRowLayout = (parent: HTMLElement, child: Nullable<HTMLElement>) => {
  const siblings = getChildBlocks(parent).filter((element) => element !== child);

  if (!child || !siblings.length) {
    const {display, flexDirection} = getComputedStyle(parent);
    return display.includes('flex') && flexDirection.startsWith('row');
  }

  const rect = child.getBoundingClientRect();

  return siblings.some((sibling) => {
    const other = sibling.getBoundingClientRect();
    return other.left >= rect.right - 1 || other.right <= rect.left + 1;
  });
}

/** Курсор не дошёл до середины блока — значит, вставать надо перед ним */
const isBeforeBlock = (rect: DOMRect, x: number, y: number, isRow: boolean) => {
  if (!isRow) {
    return y < rect.top + rect.height / 2;
  }

  // блоки в строку могут переноситься, поэтому сначала смотрим на саму строку
  if (y < rect.top) {
    return true;
  }

  if (y > rect.bottom) {
    return false;
  }

  return x < rect.left + rect.width / 2;
}

/**
 * Перетаскивание блоков по холсту. Меняется только место блока в дереве —
 * ни стили, ни id не трогаются, поэтому за блоком едет всё его оформление.
 *
 * Куда встанет блок, считается по настоящему холсту, а не по данным: только
 * браузер знает, где на самом деле оказались дети flex и grid.
 */
export const useBlockDrag = (
  canvas: Readonly<Ref<Nullable<HTMLElement>>>,
  {onMove, onPlace}: {
    /** Блок переехал по дереву */
    onMove: (id: string, target: IDropTarget) => void;
    /** Свободный блок переехал по координатам */
    onPlace: (id: string, placement: {left: number; top: number}) => void;
  }
) => {
  /** Блок, который сейчас едет; null — ничего не тащим */
  const dragId = ref<Nullable<string>>(null);
  const hint = ref<Nullable<IDropHint>>(null);

  let dragged: Nullable<HTMLElement> = null;
  let pendingId: Nullable<string> = null;
  let target: Nullable<IDropTarget> = null;
  let startPoint = {x: 0, y: 0};
  let pointer = {x: 0, y: 0};
  let scrollFrame = 0;
  /** Свободный блок двигают за координаты — дерево при этом не меняется */
  let isFree = false;
  let startPlacement: Nullable<IPlacement> = null;
  let pendingPlacement: Nullable<{left: number; top: number}> = null;
  let placeFrame = 0;

  /** Подсказка живёт в координатах холста: он прокручивается вместе со страницей */
  const buildHint = (parent: HTMLElement, index: number, isRow: boolean): Nullable<IDropHint> => {
    const canvasEl = canvas.value;

    if (!canvasEl) {
      return null;
    }

    const base = canvasEl.getBoundingClientRect();
    const shift = (rect: DOMRect) => ({
      left: rect.left - base.left + canvasEl.scrollLeft,
      top: rect.top - base.top + canvasEl.scrollTop,
    });

    const children = getChildBlocks(parent);

    // в пустом родителе вставать не рядом с чем, поэтому показываем его целиком
    if (!children.length) {
      const rect = parent.getBoundingClientRect();
      return {...shift(rect), width: rect.width, height: rect.height, isLine: false};
    }

    const isLast = index >= children.length;
    const anchor = (isLast ? children.at(-1)! : children[index]).getBoundingClientRect();
    const {left, top} = shift(anchor);

    return isRow
      ? {
        left: (isLast ? left + anchor.width : left) - LINE_SIZE / 2,
        top,
        width: LINE_SIZE,
        height: anchor.height,
        isLine: true,
      }
      : {
        left,
        top: (isLast ? top + anchor.height : top) - LINE_SIZE / 2,
        width: anchor.width,
        height: LINE_SIZE,
        isLine: true,
      };
  }

  const findTarget = (): Nullable<{target: IDropTarget; hint: Nullable<IDropHint>}> => {
    const canvasEl = canvas.value;

    if (!canvasEl || !dragged) {
      return null;
    }

    // сам блок и всё, что внутри него, целью быть не могут
    const hovered = document.elementsFromPoint(pointer.x, pointer.y)
      .find((element) => isBlock(element) && canvasEl.contains(element) && !dragged!.contains(element));

    if (!isBlock(hovered)) {
      return null;
    }

    const rect = hovered.getBoundingClientRect();
    const canHoldBlocks = !voidTags.has(hovered.tagName.toLowerCase());
    const edgeX = Math.min(rect.width * EDGE_RATIO, EDGE_LIMIT);
    const edgeY = Math.min(rect.height * EDGE_RATIO, EDGE_LIMIT);

    // в середине блока кладём внутрь него, у края — рядом с ним
    const isInside = canHoldBlocks
      && pointer.x > rect.left + edgeX && pointer.x < rect.right - edgeX
      && pointer.y > rect.top + edgeY && pointer.y < rect.bottom - edgeY;

    const parent = isInside ? hovered : isBlock(hovered.parentElement) ? hovered.parentElement : null;

    if (!parent || dragged.contains(parent)) {
      return null;
    }

    const children = getChildBlocks(parent);
    const isRow = isRowLayout(parent, isInside ? children[0] ?? null : hovered);
    let index: number;

    if (isInside) {
      const before = children.findIndex((child) => isBeforeBlock(child.getBoundingClientRect(), pointer.x, pointer.y, isRow));
      index = before === -1 ? children.length : before;
    } else {
      const position = children.indexOf(hovered);
      index = isBeforeBlock(rect, pointer.x, pointer.y, isRow) ? position : position + 1;
    }

    return {
      target: {parentId: parent.getAttribute('data-id')!, index},
      hint: buildHint(parent, index, isRow),
    };
  }

  const updateHint = () => {
    const found = findTarget();

    target = found?.target ?? null;
    hint.value = found?.hint ?? null;
  }

  const autoScroll = () => {
    const canvasEl = canvas.value;

    if (!canvasEl || !dragId.value) {
      return;
    }

    const rect = canvasEl.getBoundingClientRect();
    const speed = pointer.y - rect.top < SCROLL_ZONE
      ? -SCROLL_STEP
      : rect.bottom - pointer.y < SCROLL_ZONE ? SCROLL_STEP : 0;

    if (speed) {
      canvasEl.scrollTop += speed;
      updateHint();
    }

    scrollFrame = requestAnimationFrame(autoScroll);
  }

  /** Куда встанет свободный блок при текущем положении курсора */
  const getFreePlacement = (isSnapping: boolean) => {
    const step = isSnapping ? SNAP_STEP : 1;
    const shift = (value: number) => Math.round(value / step) * step;

    return {
      left: shift(startPlacement!.left + pointer.x - startPoint.x),
      top: shift(startPlacement!.top + pointer.y - startPoint.y),
    };
  }

  const flushPlace = () => {
    placeFrame = 0;

    if (dragId.value && pendingPlacement) {
      onPlace(dragId.value, pendingPlacement);
      pendingPlacement = null;
    }
  }

  /** Координаты пишутся раз в кадр: событий мыши приходит куда больше */
  const queuePlace = (placement: {left: number; top: number}) => {
    pendingPlacement = placement;

    if (!placeFrame) {
      placeFrame = requestAnimationFrame(flushPlace);
    }
  }

  const stopDrag = () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('keydown', onKeydown);
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(placeFrame);

    dragId.value = null;
    hint.value = null;
    dragged = null;
    pendingId = null;
    target = null;
    startPlacement = null;
    pendingPlacement = null;
    placeFrame = 0;
  }

  const onPointerMove = (event: PointerEvent) => {
    pointer = {x: event.clientX, y: event.clientY};

    if (!dragId.value) {
      // пока курсор почти не уехал, человек просто выбирает блок
      if (Math.hypot(pointer.x - startPoint.x, pointer.y - startPoint.y) < DRAG_THRESHOLD) {
        return;
      }

      dragId.value = pendingId;

      // свободный блок ни во что не вкладывается, поэтому холст под ним не крутим
      if (!isFree) {
        scrollFrame = requestAnimationFrame(autoScroll);
      }
    }

    // пока блок едет, курсор не должен выделять текст страницы
    event.preventDefault();

    if (isFree) {
      queuePlace(getFreePlacement(event.shiftKey));
      return;
    }

    updateHint();
  }

  /**
   * Гасит клик, который браузер шлёт сразу после перетаскивания: иначе он выбрал
   * бы блок под курсором. Если клика так и не случилось — курсор ушёл за окно, —
   * гаситель снимается сам, чтобы не съесть следующий клик человека.
   */
  const suppressClick = () => {
    const skip = (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      window.removeEventListener('click', skip, true);
    };

    window.addEventListener('click', skip, true);
    setTimeout(() => window.removeEventListener('click', skip, true), 300);
  }

  const onPointerUp = () => {
    const id = dragId.value;
    const drop = target;
    const wasFree = isFree;

    // последний кадр мог не успеть — дописываем то, куда блок довели
    if (wasFree) {
      flushPlace();
    }

    stopDrag();

    if (!id) {
      return;
    }

    // после перетаскивания браузер шлёт клик — он выбрал бы блок под курсором
    suppressClick();

    if (drop && !wasFree) {
      onMove(id, drop);
    }
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.code !== 'Escape') {
      return;
    }

    // свободный блок уже уехал по холсту — возвращаем его туда, где взяли
    if (isFree && dragId.value && startPlacement) {
      onPlace(dragId.value, startPlacement);
    }

    stopDrag();
  }

  /** Блок берут за него самого: пока курсор не поехал, это обычный клик */
  const startDrag = (event: PointerEvent, id: string) => {
    if (event.button !== 0) {
      return;
    }

    dragged = event.currentTarget as HTMLElement;
    pendingId = id;
    startPoint = {x: event.clientX, y: event.clientY};
    pointer = startPoint;

    // как поедет блок, решает он сам: свободный — за координаты, обычный — по дереву
    isFree = isFreeBlock(dragged);
    startPlacement = isFree
      ? getPlacement(dragged, (dragged.offsetParent as Nullable<HTMLElement>) ?? canvas.value!)
      : null;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeydown);
  }

  onBeforeUnmount(stopDrag);

  return {dragId, hint, startDrag};
}
