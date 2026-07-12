import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { EmptyStateComponent } from './empty-state.component';

@Component({
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state
      [eyebrow]="eyebrow"
      [title]="title"
      [description]="description"
    >
      <a href="/products">Ver todos os produtos</a>
    </app-empty-state>
  `,
})
class TestHostComponent {
  eyebrow = '';
  title = '';
  description = '';
}

describe('EmptyStateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders a descriptive empty state with optional action content', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.eyebrow = 'Sem produtos';
    fixture.componentInstance.title = 'Sua busca não retornou resultados';
    fixture.componentInstance.description = 'Tente revisar os filtros ou buscar por outro termo.';
    fixture.detectChanges();

    const status = fixture.debugElement.query(By.css('[role="status"]'));
    expect(status).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Sem produtos');
    expect(fixture.nativeElement.textContent).toContain('Sua busca não retornou resultados');
    expect(fixture.nativeElement.textContent).toContain('Ver todos os produtos');
  });
});
