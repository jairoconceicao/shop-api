import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { ProductCardComponent } from './product-card.component';

@Component({
  imports: [ProductCardComponent],
  template: `
    <app-product-card [product]="product" [ctaLabel]="ctaLabel" [ctaLink]="ctaLink" />
  `,
})
class TestHostComponent {
  product: any = null;
  ctaLabel = '';
  ctaLink = '';
}

describe('ProductCardComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    });
  });

  it('renders the product image, title, price, stock and CTA', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.product = {
      produtoId: 101,
      titulo: 'Notebook Gamer',
      thumb: 'https://cdn.shopapi.dev/notebook.jpg',
      preco: 5999.9,
      estoque: 12,
      categoria: {
        categoriaId: 1,
        titulo: 'Informática',
      },
    };
    fixture.componentInstance.ctaLabel = 'Ver produto';
    fixture.componentInstance.ctaLink = '/products/101';
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Notebook Gamer');
    
    const img = fixture.debugElement.query(By.css('img[alt="Notebook Gamer"]'));
    expect(img).toBeTruthy();
    
    expect(fixture.nativeElement.textContent).toContain('R$ 5.999,90');
    expect(fixture.nativeElement.textContent).toContain('12 em estoque');
    
    const link = fixture.debugElement.query(By.css('a[aria-label="Ver produto"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('href')).toBe('/products/101');
  });

  it('falls back to the default visual treatment when the product has no image', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.product = {
      produtoId: 102,
      titulo: 'Mouse Sem Fio',
      thumb: null,
      preco: '129.9',
      estoque: '0',
      categoria: null,
    };
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mouse Sem Fio');
    
    const img = fixture.debugElement.query(By.css('img'));
    expect(img).toBeNull();
    
    expect(fixture.nativeElement.textContent).toContain('R$ 129,90');
    expect(fixture.nativeElement.textContent).toContain('0 em estoque');
    
    const link = fixture.debugElement.query(By.css('a'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Comprar');
    expect(link.nativeElement.getAttribute('href')).toBe('/products/102');
  });
});
