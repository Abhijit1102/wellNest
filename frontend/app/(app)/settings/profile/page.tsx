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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account information</p>
      </div>

      <Card className="border-primary/20 max-w-2xl">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {success && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-primary text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your email address cannot be changed at this time.
                </p>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user?.username || ''}
                  placeholder="Your username"
                  disabled={isLoading}
                />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/20 max-w-2xl">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Account information and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="font-medium text-foreground">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Account status</span>
            <span className="text-sm font-medium text-primary">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
