import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { ErrorStateComponent } from './error-state.component';

@Component({
  imports: [ErrorStateComponent],
  template: `
    <app-error-state
      [eyebrow]="eyebrow"
      [title]="title"
      [description]="description"
      [details]="details"
    >
      <button>Recarregar</button>
    </app-error-state>
  `,
})
class TestHostComponent {
  eyebrow = '';
  title = '';
  description = '';
  details = '';
}

describe('ErrorStateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the error details and projected recovery action', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.eyebrow = 'Falha na requisição';
    fixture.componentInstance.title = 'Não foi possível carregar os dados';
    fixture.componentInstance.description = 'Tente novamente em alguns instantes.';
    fixture.componentInstance.details = 'Timeout ao acessar a API.';
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Falha na requisição');
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar os dados');
    expect(fixture.nativeElement.textContent).toContain('Timeout ao acessar a API.');
    expect(fixture.nativeElement.textContent).toContain('Recarregar');
  });
});
