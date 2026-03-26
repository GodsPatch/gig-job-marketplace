'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import { GuestGuard } from '@/components/auth/RouteGuard';
import { Suspense } from 'react';

/**
 * Login page — protected by GuestGuard (redirects if already logged in).
 */
export default function LoginPage() {
  return (
    <GuestGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
