'use client';

import { RegisterForm } from '@/components/auth/RegisterForm';
import { GuestGuard } from '@/components/auth/RouteGuard';

/**
 * Register page — protected by GuestGuard (redirects if already logged in).
 */
export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}
