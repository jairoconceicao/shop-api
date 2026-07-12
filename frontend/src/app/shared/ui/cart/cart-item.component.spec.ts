import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { CartItemComponent } from './cart-item.component';

@Component({
  imports: [CartItemComponent],
  template: `
    <app-cart-item
      [item]="item"
      (quantityChange)="onQuantityChange($event)"
      (remove)="onRemove()"
    />
  `,
})
class TestHostComponent {
  item: any = null;
  onQuantityChange = (v: number) => {};
  onRemove = () => {};
}

describe('CartItemComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders item details and emits quantity/remove actions', () => {
    const quantityChanges: number[] = [];
    let removeCalled = false;

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.item = {
      itemId: 9,
      produtoId: 101,
      quantidade: 2,
      valorUnitario: 199.9,
    };
    fixture.componentInstance.onQuantityChange = (v: number) => quantityChanges.push(v);
    fixture.componentInstance.onRemove = () => {
      removeCalled = true;
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Produto #101');
    expect(fixture.nativeElement.textContent).toContain('R$ 399,80');

    const decreaseButton = fixture.debugElement.query(By.css('button[aria-label="Diminuir quantidade"]'));
    expect(decreaseButton).toBeTruthy();
    decreaseButton.nativeElement.click();
    fixture.detectChanges();

    const removeButton = fixture.debugElement.query(By.css('button'));
    const removeBtn = Array.from(fixture.debugElement.queryAll(By.css('button')))
      .find(btn => btn.nativeElement.textContent.includes('Remover'));
    expect(removeBtn).toBeTruthy();
    removeBtn!.nativeElement.click();
    fixture.detectChanges();

    expect(quantityChanges).toEqual([1]);
    expect(removeCalled).toBe(true);
  });
});
