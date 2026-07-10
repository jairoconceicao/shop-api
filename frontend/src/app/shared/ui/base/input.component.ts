import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from '@angular/core';
import { NgxMaskDirective } from 'ngx-mask';
import { createUiId } from './ui-id';
import { FormErrorComponent } from './form-error.component';

type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date';

@Component({
  selector: 'app-input',
  imports: [NgClass, FormErrorComponent, NgxMaskDirective],
  template: `
    <label class="block" [for]="id()">
      <span class="mb-2 block text-sm font-semibold text-shop-text">
        {{ label() }}
        @if (required()) {
          <span class="ml-1 text-shop-danger" aria-hidden="true">*</span>
        }
      </span>

      @if (mask()) {
        <input
          [id]="id()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [name]="name() || null"
          [autocomplete]="autocomplete() || null"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [mask]="mask()"
          [dropSpecialCharacters]="dropSpecialCharacters()"
          [clearIfNotMatch]="clearIfNotMatch()"
          [attr.inputmode]="inputMode() || null"
          [attr.aria-invalid]="isInvalid() ? 'true' : null"
          [attr.aria-describedby]="describedBy() || null"
          [ngClass]="classes()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
        />
      } @else {
        <input
          [id]="id()"
          [type]="type()"
          [value]="value()"
          [placeholder]="placeholder()"
          [name]="name() || null"
          [autocomplete]="autocomplete() || null"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [attr.inputmode]="inputMode() || null"
          [attr.aria-invalid]="isInvalid() ? 'true' : null"
          [attr.aria-describedby]="describedBy() || null"
          [ngClass]="classes()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
        />
      }

      @if (hint()) {
        <p [id]="hintId()" class="mt-2 text-sm text-shop-text-muted">{{ hint() }}</p>
      }

      <app-form-error [id]="errorId()" [error]="error()" />
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent {
  readonly id = input<string>(createUiId('shop-input'));
  readonly label = input.required<string>();
  readonly type = input<InputType>('text');
  readonly value = input('');
  readonly placeholder = input('');
  readonly name = input('');
  readonly autocomplete = input('');
  readonly inputMode = input('');
  readonly hint = input('');
  readonly mask = input('');
  readonly dropSpecialCharacters = input(true);
  readonly clearIfNotMatch = input(false);
  readonly error = input<string | readonly string[] | null>(null);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly required = input(false);

  @Output() readonly valueChange = new EventEmitter<string>();
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

  protected readonly classes = computed(() => {
    const base =
      'w-full rounded-2xl border bg-shop-background px-4 py-3 text-shop-text outline-none transition placeholder:text-shop-text-light focus:border-shop-primary focus:bg-white focus:ring-2 focus:ring-shop-primary/10 disabled:cursor-not-allowed disabled:opacity-60';
    return [
      base,
      this.isInvalid() ? 'border-shop-danger focus:border-shop-danger focus:ring-shop-danger/10' : 'border-shop-border',
    ];
  });

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  handleBlur(): void {
    this.blurred.emit();
  }
}
