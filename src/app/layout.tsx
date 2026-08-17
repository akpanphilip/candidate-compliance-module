import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E3OS Candidate Compliance',
  description: 'Tenant-aware candidate compliance mini-module',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
