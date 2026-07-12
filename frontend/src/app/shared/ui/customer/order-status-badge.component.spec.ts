import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { OrderStatusBadgeComponent } from './order-status-badge.component';

@Component({
  imports: [OrderStatusBadgeComponent],
  template: `
    <app-order-status-badge [status]="status" />
  `,
})
class TestHostComponent {
  status = '';
}

describe('OrderStatusBadgeComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders a friendly label and semantic variant for processed orders', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.status = 'Processado';
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[aria-label="Status do pedido"]'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('Processado');
    expect(badge.nativeElement.classList.contains('bg-shop-success-soft')).toBe(true);
    expect(badge.nativeElement.classList.contains('text-shop-success')).toBe(true);
  });

  it('renders a danger variant for canceled orders', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.status = 'Cancelado';
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('[aria-label="Status do pedido"]'));
    expect(badge).toBeTruthy();
    expect(badge.nativeElement.textContent).toContain('Cancelado');
    expect(badge.nativeElement.classList.contains('bg-shop-danger-soft')).toBe(true);
    expect(badge.nativeElement.classList.contains('text-shop-danger')).toBe(true);
  });
});
