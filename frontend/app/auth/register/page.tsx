'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

// UI Components (Ensure these paths match your project)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';

// Custom Components & API
import { ConsentModal } from '@/components/ConsentModal';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  // 1. Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 2. UI & Logic State
  const [showConsent, setShowConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset errors when user types
    if (error) setError('');
    if (passwordError) setPasswordError('');
  };

  // Step 1: Local Validation & Open Consent Modal
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    // Passwords okay? Now show the legal consent form
    setShowConsent(true);
  };

  // Step 2: Final API Call (Triggered from ConsentModal)
  const handleFinalRegister = async (consent: { data_collection: boolean; ai_training: boolean }) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.username, // Map UI 'username' to DB 'full_name'
        consent: consent,
      });

      if (res.success) {
        // Registration successful! Redirecting...
        router.push('/dashboard');
      } else {
        // Backend returned an error (e.g., User already exists)
        setError(res.error || 'Registration failed');
        setShowConsent(false); // Close modal so user can fix details
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
      setShowConsent(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        
        {/* Branding */}
        <div className="flex justify-center mb-8 gap-2 items-center">
          <Leaf className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-playfair">WellNest</h1>
        </div>

        <Card className="border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-playfair">Create your account</CardTitle>
            <CardDescription className="font-roboto-condensed">Start your mental wellness journey with WellNest</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Error Alerts */}
            {(error || passwordError) && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive">
                  {error || passwordError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Full Name</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                {isLoading ? 'Processing...' : 'Create account'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
                </div>
              </div>

              <Link href="/auth/login" className="block mt-4">
                <Button variant="outline" className="w-full">Sign in</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* The Consent Modal (Triggered after form validation) */}
        <ConsentModal
          isOpen={showConsent}
          onClose={() => setShowConsent(false)}
          onConfirm={handleFinalRegister}
          isLoading={isLoading}
        />

        <p className="text-center text-sm text-muted-foreground mt-8">
          Your wellbeing matters. Let&apos;s take care of it together
        </p>
      </div>
    </div>
  );
}