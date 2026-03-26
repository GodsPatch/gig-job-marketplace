'use client';

import { AuthProvider } from '@/lib/auth';

/**
 * Client-side providers wrapper.
 * AuthProvider must be rendered on client side (uses hooks, context).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
