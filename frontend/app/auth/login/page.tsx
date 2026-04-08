'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogoSvg } from '@/components/LogoSvg';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';

export default function LoginPage() {
  const router = useRouter();

  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ Handles refresh case
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    console.log('[LOGIN PAGE] Submitting login form');
    const success = await login(email, password);
    console.log('[LOGIN PAGE] Login result:', success);

    // 🔥 MAIN FIX (no race condition)
    if (success) {
      console.log('[LOGIN PAGE] Login successful, redirecting to dashboard');
      // Use replace to avoid back button issues, but navigate after state is set
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } else {
      console.log('[LOGIN PAGE] Login failed, staying on page');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <LogoSvg className="w-8 h-8" />
            <span className="text-2xl font-bold text-foreground font-playfair">
              WellNest
            </span>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-playfair">Welcome back</CardTitle>
            <CardDescription className="font-roboto-condensed">
              Sign in to your mental wellness journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">
                  Create account
                </Button>
              </Link>

              <Link href="/auth/forgot-password" className="block">
                <Button variant="ghost" className="w-full">
                  Forgot password?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}