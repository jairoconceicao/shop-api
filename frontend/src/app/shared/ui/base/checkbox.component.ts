import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { createUiId } from './ui-id';
import { FormErrorComponent } from './form-error.component';

@Component({
  selector: 'app-checkbox',
  imports: [FormErrorComponent],
  template: `
    <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-shop-border bg-white px-4 py-3 transition has-[:focus-visible]:border-shop-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-shop-primary/10">
      <input
        [id]="id()"
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy() || null"
        class="mt-1 h-4 w-4 rounded border-shop-border text-shop-primary focus:ring-shop-primary disabled:cursor-not-allowed disabled:opacity-60"
        (change)="handleChange($event)"
        (blur)="blurred.emit()"
      />

      <span class="min-w-0">
        <span class="block text-sm font-semibold text-shop-text">
          {{ label() }}
          @if (required()) {
            <span class="ml-1 text-shop-danger" aria-hidden="true">*</span>
          }
        </span>

        @if (hint()) {
          <span [id]="hintId()" class="mt-1 block text-sm text-shop-text-muted">{{ hint() }}</span>
        }

        <app-form-error [id]="errorId()" [error]="error()" />
      </span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly id = input<string>(createUiId('shop-checkbox'));
  readonly label = input.required<string>();
  readonly checked = input(false);
  readonly hint = input('');
  readonly error = input<string | readonly string[] | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);

  @Output() readonly checkedChange = new EventEmitter<boolean>();
  @Output() readonly blurred = new EventEmitter<void>();

  protected readonly hintId = computed(() => `${this.id()}-hint`);
  protected readonly errorId = computed(() => `${this.id()}-error`);
  protected readonly isInvalid = computed(() => Boolean(this.error()));
  protected readonly describedBy = computed(() => {
    const describedBy: string[] = [];

    if (this.hint()) {
      describedBy.push(this.hintId());
    }

    if (this.error()) {
      describedBy.push(this.errorId());
    }

    return describedBy.join(' ');
  });

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
