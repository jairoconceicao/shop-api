import { describe, expect, it } from 'vitest';

import { task120SupportedBreakpoints } from './task-120.context';

describe('task120SupportedBreakpoints', () => {
  it('keeps the supported responsive ranges documented in the task', () => {
    expect(task120SupportedBreakpoints).toEqual({
      mobileSmall: 480,
      mobileLarge: 768,
      tablet: 1024,
      desktop: 1280,
    });
  });
});
