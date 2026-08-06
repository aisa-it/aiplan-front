/**
 * Обработчик для горизонтальной прокрутки
 * @param element передается сам элемент или родитель элемента, HTMLElement.
 * Если element это родитель, то нужно указать класс по которому будет идти поиск нужного элемента.
 * @param classNameElement передается класс элемента, для которого нужна обработка скролла.
 */
export function mouseWheelScrollHandler(element: HTMLElement | null, isVertical: boolean, classNameElement?: string) {
  if (element) {
    element.onwheel = (event) => {
      const el = classNameElement? element.querySelector(`.${classNameElement}`) || element : element;
      if (isVertical) {
        if (event.deltaX !== 0) {
          el.scrollTop += event.deltaX;
          event.preventDefault();
        }
      } else {
        if (event.deltaY !== 0) {
          el.scrollLeft += event.deltaY;
          event.preventDefault();
        }
      }
    };
  }
}