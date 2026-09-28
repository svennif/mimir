import { Settings } from 'lucide-react';
import type { Metadata } from 'next';
import { ThemeControl } from '@/src/components/ThemeControl';
import { TOOLBAR_CLEARANCE } from '@/src/lib/toolbar';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border border-line bg-sheet shadow-sheet md:rounded-lg">
      <header className={`flex shrink-0 items-start justify-between gap-6 border-b border-line px-5 pb-5 md:px-8 md:pb-7 ${TOOLBAR_CLEARANCE}`}>
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <Settings className="size-5 text-ink-secondary" aria-hidden="true" />
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Settings</h1>
          </div>
          <p className="text-sm text-ink-secondary">Preferences for this browser.</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col items-start gap-3 border border-line rounded-md px-4 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Appearance</h2>
            <p className="mt-1.5 text-sm/5 text-ink-secondary">System follows your device&rsquo;s light and dark setting.</p>
          </div>
          <ThemeControl />
        </div>
      </div>
    </section>
  );
}
