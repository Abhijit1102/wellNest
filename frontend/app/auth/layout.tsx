'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground transition-colors duration-300">{children}</div>;
}
