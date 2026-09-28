'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { THEMES, type Theme } from '@/src/lib/theme';
import { themeActions, themeStore } from '@/src/stores/theme';

const OPTIONS: Record<Theme, { label: string; icon: React.ReactNode }> = {
  light: { label: 'Light', icon: <Sun className="size-4" aria-hidden="true" /> },
  dark: { label: 'Dark', icon: <Moon className="size-4" aria-hidden="true" /> },
  system: { label: 'System', icon: <Monitor className="size-4" aria-hidden="true" /> },
};

export function ThemeControl() {
  // On the first client render this is still the pristine 'system' the server
  // rendered, then it corrects to the real value — same one-frame settle the
  // sidebar's collapsed state has. The page itself never flashes, because the
  // palette comes from the class on <html>, not from here.
  const theme = themeStore((s) => s.theme);

  return (
    // Real radios rather than buttons with aria-checked: arrow-key navigation
    // inside the group then comes for free.
    <fieldset className="inline-flex items-center gap-1 rounded-md border border-line p-1">
      <legend className="sr-only">Appearance</legend>
      {THEMES.map((option) => {
        const { label, icon } = OPTIONS[option];
        const selected = theme === option;

        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm/5 font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${selected ? 'bg-active text-ink' : 'text-ink-secondary hover:bg-hover hover:text-ink'}`}>
            <input type="radio" name="theme" value={option} checked={selected} onChange={() => themeActions.set(option)} className="sr-only" />
            {icon}
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}
