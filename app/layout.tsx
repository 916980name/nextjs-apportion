import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import Locale from "./locales";
import Topbar from './topbar';

export const metadata = {
  title: Locale.Home.AppName,
  description: Locale.Home.Description
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body>
        <Topbar />
        <div className="flex flex-col">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
