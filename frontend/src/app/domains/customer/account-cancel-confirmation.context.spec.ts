import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { CustomerStore } from './customer.store';
import { createAccountCancelConfirmationState } from './account-cancel-confirmation.context';

describe('createAccountCancelConfirmationState', () => {
  it('requires an explicit confirmation before cancelling the account', () => {
    const customerStoreMock = {
      isLoading: signal(false),
      deleteProfile: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: CustomerStore, useValue: customerStoreMock }],
    });

    const state = TestBed.runInInjectionContext(() => createAccountCancelConfirmationState());

    state.begin();

    expect(state.isAwaitingConfirmation()).toBe(true);
    expect(state.confirmationTitle()).toBe('Confirmar cancelamento da conta');
    expect(state.confirmationDescription()).toContain('remover permanentemente a conta');
    expect(state.actionLabel()).toBe('Sim, cancelar conta');
    expect(state.cancelLabel()).toBe('Manter minha conta');

    state.confirm();

    expect(customerStoreMock.deleteProfile).toHaveBeenCalledTimes(1);
    expect(state.isAwaitingConfirmation()).toBe(false);
  });
});
