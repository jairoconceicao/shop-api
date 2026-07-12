import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { CartSummaryComponent } from './cart-summary.component';

@Component({
  imports: [CartSummaryComponent],
  template: `
    <app-cart-summary
      [subtotal]="subtotal"
      [shipping]="shipping"
      [ctaLabel]="ctaLabel"
    />
  `,
})
class TestHostComponent {
  subtotal = 0;
  shipping = 0;
  ctaLabel = '';
}

describe('CartSummaryComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders totals and the checkout cta', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.subtotal = 499.7;
    fixture.componentInstance.shipping = 0;
    fixture.componentInstance.ctaLabel = 'Finalizar compra';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('R$ 499,70');
    
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('Finalizar compra');
  });
});
