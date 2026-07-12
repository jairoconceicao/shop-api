import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { CartButtonComponent } from './cart-button.component';

@Component({
  imports: [CartButtonComponent],
  template: `
    <app-cart-button [count]="count" />
  `,
})
class TestHostComponent {
  count = 0;
}

describe('CartButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    });
  });

  it('renders the cart link with badge count when items exist', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.count = 3;
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('a[aria-label="Ir para o carrinho"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('href')).toBe('/cart');
    expect(fixture.nativeElement.textContent).toContain('3');
  });

  it('hides the badge when the cart is empty', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.count = 0;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('0');
  });
});
