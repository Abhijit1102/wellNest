'use client';

import { useAuthStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData();

      const username = (
        form.elements.namedItem('username') as HTMLInputElement
      )?.value;

      const age = (
        form.elements.namedItem('age') as HTMLInputElement
      )?.value;

      const fileInput = form.elements.namedItem(
        'file'
      ) as HTMLInputElement;

      // ✅ Append fields
      if (username?.trim()) {
        formData.append('username', username.trim());
      }

      if (age) {
        formData.append('age', age);
      }

      if (fileInput?.files?.[0]) {
        formData.append('file', fileInput.files[0]);
      }

      const response = await userApi.updateProfile(formData);

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

  // ✅ Image preview handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {/* Account Info */}
        <Card className="border-2 border-primary/20 bg-card">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-foreground">
              Account Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your personal details
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Success */}
              {success && (
                <div className="rounded-lg bg-primary/10 border border-primary/30 p-4 text-primary text-sm">
                  ✨ {success}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-600 text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                  />
                </Field>
              </FieldGroup>

              {/* Username */}
              <FieldGroup>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input
                    name="username"
                    defaultValue={user?.full_name || ''}
                    disabled={isLoading}
                    placeholder="Enter your name"
                  />
                </Field>
              </FieldGroup>

              {/* Age */}
              <FieldGroup>
                <Field>
                  <FieldLabel>Age</FieldLabel>
                  <Input
                    type="number"
                    name="age"
                    min={0}
                    max={120}
                    placeholder="Enter your age"
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>

              {/* Profile Image */}
              <FieldGroup>
                <Field>
                  <FieldLabel>Profile Image</FieldLabel>
                  <Input
                    type="file"
                    name="file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />

                  {/* Preview */}
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mt-4 w-24 h-24 rounded-full object-cover border"
                    />
                  )}
                </Field>
              </FieldGroup>

              {/* Submit */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card className="border-2 border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Account Status</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Member Since</span>
              <span>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : '—'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-foreground">Status</span>
              <span className="text-primary font-semibold">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}