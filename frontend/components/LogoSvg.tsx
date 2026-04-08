'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function LogoSvg({ className = 'w-8 h-8' }: { className?: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by using light mode as default until mounted
  const isDark = mounted ? theme === 'dark' : false;
  const primaryColor = isDark ? 'oklch(0.68 0.25 155)' : 'oklch(0.50 0.26 155)';
  const detailColor = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Leaf shape */}
      <ellipse
        cx="100"
        cy="100"
        rx="45"
        ry="65"
        fill={primaryColor}
        transform="rotate(-25 100 100)"
      />
      {/* Leaf vein detail */}
      <path
        d="M 100 40 Q 95 80 100 160"
        stroke={detailColor}
        strokeWidth="2"
        fill="none"
      />
      {/* Leaf stem */}
      <line
        x1="100"
        y1="160"
        x2="100"
        y2="180"
        stroke={primaryColor}
        strokeWidth="3"
      />
    </svg>
  );
}
