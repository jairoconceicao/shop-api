import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { AlertComponent } from './alert.component';

@Component({
  imports: [AlertComponent],
  template: `
    <app-alert [variant]="variant" [title]="title">
      {{ content }}
    </app-alert>
  `,
})
class TestHostComponent {
  variant: 'info' | 'success' | 'warning' | 'danger' = 'info';
  title = '';
  content = '';
}

describe('AlertComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the alert content with the selected variant', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'danger';
    fixture.componentInstance.title = 'Atenção';
    fixture.componentInstance.content = 'Não foi possível salvar sua alteração.';
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('aside[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.classList.contains('bg-shop-danger-soft')).toBe(true);
    expect(alert.nativeElement.textContent).toContain('Atenção');
    expect(alert.nativeElement.textContent).toContain('Não foi possível salvar sua alteração.');
  });

  it('renders the default info variant without a title', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = 'info';
    fixture.componentInstance.title = '';
    fixture.componentInstance.content = 'Seu cadastro foi atualizado.';
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('aside[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.classList.contains('bg-shop-primary-soft')).toBe(true);
    expect(alert.nativeElement.textContent).toContain('Seu cadastro foi atualizado.');
    expect(alert.nativeElement.textContent).not.toContain('Atenção');
  });
});
