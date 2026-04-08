'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogoSvg } from '@/components/LogoSvg';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.requestPasswordReset(email);

      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.error || 'Failed to send reset email');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <div className="w-full max-w-md">

        {/* ✅ Branding */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <LogoSvg className="w-8 h-8" />
            <span className="text-2xl font-bold text-foreground font-playfair">WellNest</span>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              {isSubmitted
                ? 'Check your email for reset instructions'
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isSubmitted ? (
              <>
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

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="space-y-4 text-center">
                {/* ✅ Success box */}
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                <p className="text-sm text-foreground">
                  ✅ Reset link sent to <strong>{email}</strong>
                </p>
              </div>

                <p className="text-sm text-muted-foreground">
                  Check your inbox (and spam folder). The link will expire soon.
                </p>

                {/* 🔥 Resend button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                  }}
                >
                  Resend Email
                </Button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Remember your password?
                  </span>
                </div>
              </div>

              <Link href="/auth/login" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          We&apos;re here to help you get back on track
        </p>
      </div>
    </div>
  );
}