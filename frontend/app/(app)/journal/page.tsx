'use client';

import { useState, useEffect } from 'react';
import { journalApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JournalEntry } from '@/lib/types';
import { Plus, Sparkles, Trash2 } from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prompt, setPrompt] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadEntries();
    loadPrompt();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await journalApi.getEntries(50);
      if (response.success && response.data) {
        setEntries(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('[v0] Failed to load journal entries:', err);
    }
  };

  const loadPrompt = async () => {
    try {
      const response = await journalApi.getPrompt();
      if (response.success && response.data) {
        setPrompt((response.data as any).text || '');
      }
    } catch (err) {
      console.error('[v0] Failed to load prompt:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await journalApi.createEntry(formData.title, formData.content);
      if (response.success) {
        setSuccess('Entry saved successfully!');
        setFormData({ title: '', content: '' });
        setTimeout(() => setSuccess(''), 3000);
        await loadEntries();
        setIsOpen(false);
      } else {
        setError(response.error || 'Failed to save entry');
      }
    } catch (err) {
      setError('An error occurred while saving your entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await journalApi.deleteEntry(id);
        if (response.success) {
          await loadEntries();
        }
      } catch (err) {
        console.error('[v0] Failed to delete entry:', err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground mt-2">
            Express your thoughts, feelings, and experiences. Your safe space for reflection.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Write a New Journal Entry</DialogTitle>
              <DialogDescription>
                Share your thoughts and feelings. This is your personal space.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-primary/50 bg-primary/5">
                <AlertDescription className="text-primary">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    placeholder="Give your entry a title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </Field>
              </FieldGroup>

              {prompt && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex gap-2 items-start mb-2">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Writing Prompt</p>
                      <p className="text-sm text-muted-foreground mt-1">{prompt}</p>
                    </div>
                  </div>
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="content">Your Thoughts</FieldLabel>
                  <Textarea
                    id="content"
                    placeholder="Write whatever is on your mind..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    disabled={isLoading}
                    className="min-h-64"
                  />
                </Field>
              </FieldGroup>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Entry'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries Grid */}
      <div>
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="border-primary/20 hover:border-primary/40 transition-colors flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-4 mb-4">
                    {entry.content}
                  </p>
                  {entry.ai_insights && (
                    <div className="mt-auto pt-4 border-t border-border">
                      <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Insights
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {entry.ai_insights}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-4xl">📓</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs">
                Start your journaling journey by writing your first entry. This is your personal space for reflection.
              </p>
              <Button
                onClick={() => setIsOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
