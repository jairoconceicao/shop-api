import { createCheckoutPaymentState } from './checkout-payment.context';

describe('createCheckoutPaymentState', () => {
  it('keeps track of the selected payment method', () => {
    const state = createCheckoutPaymentState();

    expect(state.paymentMethod()).toBe('Pix');

    state.setPaymentMethod('Cartao');

    expect(state.paymentMethod()).toBe('Cartao');
    expect(state.paymentOptions).toEqual(['Pix', 'Cartao', 'Boleto']);
  });
});
