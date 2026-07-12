import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { SkeletonStateComponent } from './skeleton-state.component';

@Component({
  imports: [SkeletonStateComponent],
  template: `
    <app-skeleton-state [eyebrow]="eyebrow" [count]="count" />
  `,
})
class TestHostComponent {
  eyebrow = '';
  count = 0;
}

describe('SkeletonStateComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the requested amount of skeleton lines', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.eyebrow = 'Buscando resultados';
    fixture.componentInstance.count = 4;
    fixture.detectChanges();

    const status = fixture.debugElement.query(By.css('[role="status"]'));
    expect(status).toBeTruthy();
    expect(status.nativeElement.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain('Buscando resultados');
    
    const pulseElements = fixture.nativeElement.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBe(7);
  });
});
