import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { QuantitySelectorComponent } from './quantity-selector.component';

@Component({
  imports: [QuantitySelectorComponent],
  template: `
    <app-quantity-selector
      [quantity]="quantity"
      [min]="min"
      (quantityChange)="onQuantityChange($event)"
    />
  `,
})
class TestHostComponent {
  quantity = 0;
  min = 0;
  onQuantityChange = (v: number) => {};
}

describe('QuantitySelectorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('emits quantity changes when the controls are used', () => {
    const emitted: number[] = [];
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.quantity = 2;
    fixture.componentInstance.onQuantityChange = (v: number) => emitted.push(v);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const decreaseButton = buttons.find(btn => 
      btn.nativeElement.getAttribute('aria-label') === 'Diminuir quantidade'
    );
    const increaseButton = buttons.find(btn => 
      btn.nativeElement.getAttribute('aria-label') === 'Aumentar quantidade'
    );

    expect(decreaseButton).toBeTruthy();
    expect(increaseButton).toBeTruthy();

    decreaseButton!.nativeElement.click();
    fixture.detectChanges();
    expect(emitted).toEqual([1]);

    increaseButton!.nativeElement.click();
    fixture.detectChanges();
    expect(emitted).toEqual([1, 3]);
  });
});
