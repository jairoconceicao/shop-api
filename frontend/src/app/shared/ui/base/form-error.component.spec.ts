import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { FormErrorComponent } from './form-error.component';

@Component({
  imports: [FormErrorComponent],
  template: `
    <app-form-error [error]="error" />
  `,
})
class TestHostComponent {
  error: string | string[] | null = null;
}

describe('FormErrorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  it('renders multiple validation messages', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.error = ['Email obrigatorio', 'Email invalido'];
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Email obrigatorio');
    expect(fixture.nativeElement.textContent).toContain('Email invalido');
  });

  it('renders a single validation message and stays hidden without errors', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.error = 'Senha obrigatoria';
    fixture.detectChanges();

    let alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeTruthy();
    expect(alert.nativeElement.textContent).toContain('Senha obrigatoria');

    fixture.componentInstance.error = null;
    fixture.detectChanges();

    alert = fixture.debugElement.query(By.css('[role="alert"]'));
    expect(alert).toBeNull();
  });
});
