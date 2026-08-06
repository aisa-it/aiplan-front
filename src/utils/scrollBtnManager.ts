import { reactive } from 'vue';

export class ScrollManager {
  private container: HTMLElement;
  private el: HTMLElement;
  private isVertical: boolean;
  public scrollState = reactive({
    showLeftArrow: false,
    showRightArrow: false,
    showTopArrow: false,
    showBottomArrow: false,
  });

  constructor(container: HTMLElement, isVertical: boolean) {
    this.container = container;
    this.el = this.container;
    this.isVertical = isVertical;
    this.updateBtnVisible();
    this.setResize();
  }

  public updateBtnVisible() {
    if (this.isVertical) {
      this.scrollState.showTopArrow = this.el?.scrollTop > 0;
      this.scrollState.showBottomArrow =
        this.el?.scrollTop + 2 < this.el?.scrollHeight - this.el?.clientHeight;
    } else {
      this.scrollState.showLeftArrow = this.el?.scrollLeft > 0;
      this.scrollState.showRightArrow =
        this.el?.scrollLeft + 2 < this.el?.scrollWidth - this.el?.clientWidth;
    }
  }

  public setResize() {
    window.addEventListener('resize', this.updateBtnVisible.bind(this));
  }

  public removeResize() {
    window.removeEventListener('resize', this.updateBtnVisible.bind(this));
  }

  public scroll(direction: number) {
    if (this.isVertical) {
      this.el.scrollBy({ top: direction, behavior: 'smooth' });
    } else {
      this.el.scrollBy({ left: direction, behavior: 'smooth' });
    }
  }
}
