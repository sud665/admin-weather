'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const lightColors = {
  line: '#2563eb',
  bar: '#f59e0b',
  scatter: '#ef4444',
  grid: '#e5e7eb',
  text: '#374151',
  tooltip: {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#1f2937',
  },
};

const darkColors = {
  line: '#60a5fa',
  bar: '#fbbf24',
  scatter: '#f87171',
  grid: '#374151',
  text: '#d1d5db',
  tooltip: {
    bg: '#1f2937',
    border: '#374151',
    text: '#f9fafb',
  },
};

export function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState(lightColors);

  useEffect(() => {
    setColors(resolvedTheme === 'dark' ? darkColors : lightColors);
  }, [resolvedTheme]);

  return colors;
}
