import { describe, expect, it } from 'vitest';

import { task121TouchTargetGuidelines } from './task-121.context';

describe('task121TouchTargetGuidelines', () => {
  it('keeps the mobile touch target guidance documented for the task', () => {
    expect(task121TouchTargetGuidelines).toEqual({
      minimumTouchTargetPx: 44,
      comfortableTouchTargetPx: 48,
      navigationItemMinHeightPx: 56,
    });
  });
});
