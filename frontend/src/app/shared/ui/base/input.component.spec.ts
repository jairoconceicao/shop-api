import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxMaskDirective, provideEnvironmentNgxMask } from 'ngx-mask';
import { beforeEach, describe, expect, it } from 'vitest';

import { InputComponent } from './input.component';

@Component({
  imports: [InputComponent],
  template: `
    <app-input
      [label]="label"
      [value]="value"
      [required]="required"
      [hint]="hint"
      [error]="error"
      [mask]="mask"
      [dropSpecialCharacters]="dropSpecialCharacters"
      [clearIfNotMatch]="clearIfNotMatch"
      (valueChange)="onValueChange($event)"
    />
  `,
})
class TestHostComponent {
  label = '';
  value = '';
  required = false;
  hint = '';
  error = '';
  mask = '';
  dropSpecialCharacters = true;
  clearIfNotMatch = false;
  onValueChange = (val: string) => {};
}

describe('InputComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideEnvironmentNgxMask()],
    });
  });

  it('renders label, hint and validation message and emits value changes', () => {
    const emittedValues: string[] = [];
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.label = 'E-mail';
    fixture.componentInstance.value = 'cliente@shopapi.dev';
    fixture.componentInstance.hint = 'Use um e-mail valido para acesso.';
    fixture.componentInstance.error = 'E-mail obrigatorio';
    fixture.componentInstance.onValueChange = (val: string) => emittedValues.push(val);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.value).toBe('cliente@shopapi.dev');
    expect(fixture.nativeElement.textContent).toContain('Use um e-mail valido para acesso.');
    
    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.textContent).toContain('E-mail obrigatorio');

    input.nativeElement.value = 'novo@shopapi.dev';
    input.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValues).toEqual(['novo@shopapi.dev']);
  });

  it('marks required fields and associates hint and error descriptions', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.label = 'Nome';
    fixture.componentInstance.required = true;
    fixture.componentInstance.hint = 'Use o nome cadastrado.';
    fixture.componentInstance.error = 'Nome obrigatorio';
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Nome');
    expect(fixture.nativeElement.textContent).toContain('*');
    expect(input.nativeElement.required).toBe(true);
    expect(input.nativeElement.classList.contains('focus-visible:ring-2')).toBe(true);
    expect(input.nativeElement.getAttribute('aria-describedby')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Use o nome cadastrado.');
    
    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.textContent).toContain('Nome obrigatorio');
  });

  it('forwards mask configuration to ngx-mask', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.label = 'CPF';
    fixture.componentInstance.mask = '000.000.000-00';
    fixture.componentInstance.dropSpecialCharacters = true;
    fixture.componentInstance.clearIfNotMatch = false;
    fixture.detectChanges();

    const maskDirective = fixture.debugElement.query(By.directive(NgxMaskDirective));
    expect(maskDirective).toBeTruthy();
    expect(maskDirective.injector.get(NgxMaskDirective).mask()).toBe('000.000.000-00');
    expect(maskDirective.injector.get(NgxMaskDirective).dropSpecialCharacters()).toBe(true);
    expect(maskDirective.injector.get(NgxMaskDirective).clearIfNotMatch()).toBe(false);
  });
});
