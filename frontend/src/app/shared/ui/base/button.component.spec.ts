import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { ButtonComponent } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button [type]="type" [variant]="variant" [size]="size" [block]="block" [disabled]="disabled">
      {{ content }}
    </app-button>
  `,
})
class TestHostComponent {
  type: 'button' | 'submit' | 'reset' = 'button';
  variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  size: 'md' | 'lg' = 'md';
  block = false;
  disabled = false;
  content = '';
}

describe('ButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the button with the requested variant and size', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.type = 'submit';
    fixture.componentInstance.variant = 'secondary';
    fixture.componentInstance.size = 'lg';
    fixture.componentInstance.content = 'Adicionar ao carrinho';
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.getAttribute('type')).toBe('submit');
    expect(button.nativeElement.classList.contains('bg-shop-secondary')).toBe(true);
    expect(button.nativeElement.classList.contains('px-6')).toBe(true);
    expect(button.nativeElement.classList.contains('min-h-11')).toBe(true);
  });

  it('applies block and disabled state styles and attributes', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.block = true;
    fixture.componentInstance.disabled = true;
    fixture.componentInstance.content = 'Comprar agora';
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.disabled).toBe(true);
    expect(button.nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(button.nativeElement.classList.contains('w-full')).toBe(true);
    expect(button.nativeElement.classList.contains('min-h-11')).toBe(true);
  });
});
