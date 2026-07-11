import { render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom/vitest';

import { App } from './app';

describe('App', () => {
  it('renders the storefront shell', async () => {
    const { fixture } = await render(App);

    expect(fixture.debugElement.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
