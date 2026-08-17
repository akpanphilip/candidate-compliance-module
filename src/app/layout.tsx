import type { Metadata } from 'next';
import { Sora } from 'next/font/google';

import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: 'Candidate Compliance',
  description: 'Tenant-aware candidate compliance mini-module',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
