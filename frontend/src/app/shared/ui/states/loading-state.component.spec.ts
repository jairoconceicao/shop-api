import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { LoadingStateComponent } from './loading-state.component';

@Component({
  imports: [LoadingStateComponent],
  template: `
    <app-loading-state
      [eyebrow]="eyebrow"
      [title]="title"
      [description]="description"
    />
  `,
})
class TestHostComponent {
  eyebrow = '';
  title = '';
  description = '';
}

describe('LoadingStateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the loading state with accessible status text', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.eyebrow = 'Processando';
    fixture.componentInstance.title = 'Carregando catálogo';
    fixture.componentInstance.description = 'Estamos preparando os produtos para exibição.';
    fixture.detectChanges();

    const status = fixture.debugElement.query(By.css('[role="status"]'));
    expect(status).toBeTruthy();
    expect(status.nativeElement.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Processando');
    expect(fixture.nativeElement.textContent).toContain('Carregando catálogo');
    expect(fixture.nativeElement.textContent).toContain('Estamos preparando os produtos para exibição.');
  });
});
