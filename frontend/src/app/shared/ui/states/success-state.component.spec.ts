import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { SuccessStateComponent } from './success-state.component';

@Component({
  imports: [SuccessStateComponent],
  template: `
    <app-success-state
      [eyebrow]="eyebrow"
      [title]="title"
      [description]="description"
    >
      <a href="/account/orders">Ver pedidos</a>
    </app-success-state>
  `,
})
class TestHostComponent {
  eyebrow = '';
  title = '';
  description = '';
}

describe('SuccessStateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders a success message and projected actions', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.eyebrow = 'Pedido confirmado';
    fixture.componentInstance.title = 'Seu pedido foi criado';
    fixture.componentInstance.description = 'Você receberá um e-mail com os próximos passos.';
    fixture.detectChanges();

    const status = fixture.debugElement.query(By.css('[role="status"]'));
    expect(status).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Pedido confirmado');
    expect(fixture.nativeElement.textContent).toContain('Seu pedido foi criado');
    expect(fixture.nativeElement.textContent).toContain('Ver pedidos');
  });
});
