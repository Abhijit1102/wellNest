'use client';

import { useState, useEffect } from 'react';
import { journalApi } from '@/lib/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Sparkles, Trash2, Pencil, Star, Loader2 } from 'lucide-react';

export interface JournalEntry {
  _id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  sentiment_score?: number | null;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ title: '', content: '' });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsFetching(true);
      const response = await journalApi.getEntries(50);
      if (response.success && response.data) {
        const result = response.data as any;
        setEntries(Array.isArray(result.entries) ? result.entries : []);
      }
    } catch (err) {
      console.error('Failed to load journal entries:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
    setError('');
    setSuccess('');
    setIsOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingId(entry._id);
    setFormData({ 
      title: entry.title || '', 
      content: entry.content || '' 
    });
    setError('');
    setSuccess('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = editingId 
        ? await journalApi.updateEntry(editingId, formData)
        : await journalApi.createEntry(formData.title, formData.content);

      if (response.success && response.data) {
        const savedEntry = response.data as JournalEntry;
        setSuccess(editingId ? 'Saved!' : 'Created!');

        if (editingId) {
          setEntries(prev => prev.map(item =>
            item._id === editingId ? savedEntry : item
          ));
        } else {
          setEntries(prev => [savedEntry, ...prev]);
        }

        setTimeout(() => {
          setIsOpen(false);
          setSuccess('');
        }, 600);
      } else {
        setError(response.error || 'Action failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        const response = await journalApi.deleteEntry(id);
        if (response.success) {
          setEntries(prev => prev.filter(item => item._id !== id));
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Journal</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Document your journey and explore your inner thoughts.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="lg" className="shadow-md gap-2">
          <Plus className="w-5 h-5" /> New Entry
        </Button>
      </div>

      {/* --- DIALOG --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingId ? 'Edit Entry' : 'Create New Entry'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Modify your existing thoughts.' : 'Write down what is on your mind today.'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold">Title</label>
              <Input
                id="title"
                placeholder="Give your entry a title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-semibold">Content</label>
              <Textarea
                id="content"
                placeholder="Start typing..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[250px] leading-relaxed"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Post Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- CONTENT GRID --- */}
      {isFetching ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <Card 
              key={entry._id}
              className="group flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 pr-10">
                    {entry.is_favorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 shrink-0" />}
                    <CardTitle className="text-xl font-bold truncate">
                      {entry.title || 'Untitled'}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(entry)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                      onClick={() => handleDelete(entry._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="font-medium">
                  {new Date(entry.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground line-clamp-5 leading-relaxed italic mb-6">
                  "{entry.content}"
                </p>

                <div className="space-y-4">
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <span 
                          key={`${tag}-${index}`} 
                          className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-md font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {(entry.sentiment_score ?? 0) !== 0 && (
                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        <Sparkles className="w-4 h-4" />
                        Mood Insight
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {((entry.sentiment_score ?? 0) * 100).toFixed(0)}% Positivity
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-2xl font-semibold">Your journal is empty</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-sm">
            Begin your storytelling journey today. Your first entry is just a click away.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="rounded-full px-8">
            Create First Entry
          </Button>
        </div>
      )}
    </div>
  );
}