import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-container',
  imports: [NgClass],
  template: `
    <section [ngClass]="wide() ? 'max-w-7xl' : 'max-w-6xl'" class="mx-auto w-full px-4 py-6 lg:px-6 lg:py-10">
      <ng-content />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  readonly wide = input(false);
}
