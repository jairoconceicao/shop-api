import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { createUiId } from './ui-id';

@Component({
  selector: 'app-form-error',
  template: `
    @if (messages().length > 0) {
      <div
        [id]="id()"
        class="mt-2 rounded-2xl border border-shop-danger/20 bg-shop-danger/10 px-4 py-3 text-sm text-shop-danger"
        role="alert"
        aria-live="polite"
      >
        @if (messages().length === 1) {
          <p>{{ messages()[0] }}</p>
        } @else {
          <ul class="space-y-1">
            @for (message of messages(); track message) {
              <li>{{ message }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorComponent {
  readonly id = input<string>(createUiId('shop-form-error'));
  readonly error = input<string | readonly string[] | null>(null);

  protected readonly messages = computed(() => {
    const error = this.error();

    if (!error) {
      return [];
    }

    return Array.isArray(error) ? error.filter(Boolean) : [error].filter(Boolean);
  });
}
