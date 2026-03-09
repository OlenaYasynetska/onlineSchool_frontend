import { Directive, ElementRef, output, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
  readonly clickOutside = output<void>();

  private handler = (event: MouseEvent) => {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.clickOutside.emit();
    }
  };

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    setTimeout(() => document.addEventListener('click', this.handler), 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handler);
  }
}
