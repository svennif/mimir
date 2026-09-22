import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { Metadata } from 'next';
import { THEME_COOKIE, parseTheme, themeClass } from '@/src/lib/theme';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Mimir',
    default: 'Mimir',
  },
  description: 'Notetaking app for Sven Ingar Frantzen',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Painting the palette class server-side is what keeps a forced light/dark
  // from flashing the other one first. Cost: every route renders dynamically.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable} ${themeClass(theme)}`}>
      <body className="size-full bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
