'use client';

import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { useState } from 'react';
import { userApi } from '@/lib/api';

export default function ProfileSettingsPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await userApi.updateProfile({
        username: formData.get('username'),
        // Add more fields as needed
      });

      if (response.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40">
      <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-100">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-playfair">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-lg font-roboto-condensed">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* Account Information Card */}
        <Card className="border-2 border-emerald-200">
          <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
            <CardTitle className="font-playfair text-emerald-900">Account Information</CardTitle>
            <CardDescription className="text-emerald-700/70">Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {success && (
                <div className="rounded-lg bg-emerald-50 border-2 border-emerald-200 p-4 text-emerald-700 text-sm font-medium animate-in fade-in">
                  ✨ {success}
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-rose-50 border-2 border-rose-200 p-4 text-rose-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email" className="text-emerald-900 font-bold">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-emerald-50/50 border-2 border-emerald-200"
                  />
                  <p className="text-xs text-emerald-600/60 mt-1">
                    Your email address cannot be changed at this time.
                  </p>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username" className="text-emerald-900 font-bold">Full Name</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={user?.full_name || ''}
                    placeholder="Your full name"
                    disabled={isLoading}
                    className="border-2 focus:border-emerald-500 focus-visible:ring-emerald-500"
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card className="border-2 border-emerald-200">
          <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
            <CardTitle className="font-playfair text-emerald-900">Account Status</CardTitle>
            <CardDescription className="text-emerald-700/70">Account information and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center py-3 border-b-2 border-emerald-200">
              <span className="text-sm font-medium text-emerald-900">Member Since</span>
              <span className="font-bold text-emerald-700">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-emerald-900">Account Status</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">✓ Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
