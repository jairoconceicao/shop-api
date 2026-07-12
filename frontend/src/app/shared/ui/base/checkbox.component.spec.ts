import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { CheckboxComponent } from './checkbox.component';

@Component({
  imports: [CheckboxComponent],
  template: `
    <app-checkbox
      [label]="label"
      [checked]="checked"
      [required]="required"
      [hint]="hint"
      [error]="error"
      (checkedChange)="onChecked($event)"
      (blurred)="onBlur()"
    />
  `,
})
class TestHostComponent {
  label = '';
  checked = false;
  required = false;
  hint = '';
  error = '';
  onChecked = (value: boolean) => {};
  onBlur = () => {};
}

describe('CheckboxComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders the checkbox and emits checked changes', () => {
    const emittedValues: boolean[] = [];
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.label = 'Lembrar-me';
    fixture.componentInstance.checked = false;
    fixture.componentInstance.hint = 'Mantem a sessao ativa neste dispositivo.';
    fixture.componentInstance.onChecked = (value: boolean) => emittedValues.push(value);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(checkbox).toBeTruthy();
    expect(checkbox.nativeElement.checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Mantem a sessao ativa neste dispositivo.');

    checkbox.nativeElement.checked = true;
    checkbox.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emittedValues).toEqual([true]);
  });

  it('links hint and error messages and emits blur events', () => {
    const blurredEvents: number[] = [];
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.label = 'Aceito os termos';
    fixture.componentInstance.required = true;
    fixture.componentInstance.hint = 'Leia os termos antes de continuar.';
    fixture.componentInstance.error = 'Aceite os termos para seguir.';
    fixture.componentInstance.onBlur = () => blurredEvents.push(1);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(checkbox).toBeTruthy();
    expect(checkbox.nativeElement.required).toBe(true);
    expect(checkbox.nativeElement.classList.contains('focus-visible:ring-2')).toBe(true);
    expect(checkbox.nativeElement.getAttribute('aria-describedby')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Leia os termos antes de continuar.');
    
    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.textContent).toContain('Aceite os termos para seguir.');

    checkbox.nativeElement.dispatchEvent(new Event('blur'));
    expect(blurredEvents).toEqual([1]);
  });
});
