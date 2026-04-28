import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'NUTECH BusTrack',
  description: 'Real-time bus tracking for NUTECH University, Islamabad',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NUTECH BusTrack',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B3A6B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
