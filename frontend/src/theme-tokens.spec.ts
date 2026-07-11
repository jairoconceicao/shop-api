const tokens = {
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  secondary: '#f97316',
  secondarySoft: '#ffedd5',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  background: '#f8fafc',
  surface: '#ffffff',
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3 ? normalized.split('').map((part) => part + part).join('') : normalized;
  const value = Number.parseInt(expanded, 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const transform = (channel: number): number => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const [r, g, b] = [red, green, blue].map(transform);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const luminanceA = relativeLuminance(hexToRgb(foreground));
  const luminanceB = relativeLuminance(hexToRgb(background));
  const [higher, lower] = luminanceA > luminanceB ? [luminanceA, luminanceB] : [luminanceB, luminanceA];

  return (higher + 0.05) / (lower + 0.05);
}

describe('theme tokens', () => {
  it('keeps contrast adequate for primary action, semantic and text tokens on light surfaces', () => {
    expect(contrastRatio(tokens.text, tokens.background)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(tokens.textMuted, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.textLight, tokens.surface)).toBeGreaterThanOrEqual(4.5);

    expect(contrastRatio(tokens.primary, tokens.primarySoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.secondary, tokens.secondarySoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.success, tokens.successSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.warning, tokens.warningSoft)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens.danger, tokens.dangerSoft)).toBeGreaterThanOrEqual(4.5);
  });
});
