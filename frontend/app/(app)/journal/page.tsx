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
import { Plus, Sparkles, Trash2, Pencil, Star, Loader2, BookOpen } from 'lucide-react';

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

  const handleToggleFavorite = async (entry: JournalEntry) => {
    const newStatus = !entry.is_favorite;
    setEntries(prev => prev.map(item => 
      item._id === entry._id ? { ...item, is_favorite: newStatus } : item
    ));

    try {
      const response = await journalApi.toggleFavorite(entry._id, newStatus);
      if (!response.success) {
        setEntries(prev => prev.map(item => 
          item._id === entry._id ? { ...item, is_favorite: !newStatus } : item
        ));
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setEntries(prev => prev.map(item => 
        item._id === entry._id ? { ...item, is_favorite: !newStatus } : item
      ));
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

  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return 'bg-primary/5 border-primary/40 text-primary';
    if (score >= 0.3) return 'bg-primary/5 border-primary/30 text-muted-foreground';
    if (score >= 0) return 'bg-muted/50 border-border text-muted-foreground';
    return 'bg-destructive/5 border-destructive/30 text-destructive';
  };

  const getSentimentEmoji = (score: number) => {
    if (score >= 0.6) return '🌿';
    if (score >= 0.3) return '🌱';
    if (score >= 0) return '🍃';
    return '🍂';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-xl shadow-lg">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground font-playfair">
                Your Journal
              </h1>
            </div>
            <p className="text-muted-foreground text-lg ml-14 font-roboto-condensed">
              Document your growth and explore your inner forest.
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate} 
            size="lg" 
            className="shadow-lg gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground border-0 transition-all hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5" /> New Entry
          </Button>
        </div>

        {/* --- DIALOG UPDATED TO GREEN --- */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[650px] border-2 border-border">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-foreground font-playfair">
                {editingId ? 'Edit Entry' : 'Create New Entry'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingId ? 'Nurture your existing thoughts.' : 'Plant the seeds of your thoughts today.'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-primary/10 border-primary/30 text-primary animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertDescription className="font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-foreground font-roboto-condensed">Title</label>
                <Input
                  id="title"
                  placeholder="A title for your growth..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 text-base border-2 focus:border-primary focus-visible:ring-primary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-bold text-foreground font-roboto-condensed">Content</label>
                <Textarea
                  id="content"
                  placeholder="Let your thoughts flow like a river..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[300px] leading-relaxed text-base border-2 focus:border-primary focus-visible:ring-primary/50 resize-none"
                  required
                />
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="min-w-[100px]">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Post Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* --- CONTENT GRID WITH GREEN ACCENTS --- */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Gathering your leaves...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
            {entries.map((entry) => (
              <Card 
                key={entry._id}
                className="group flex flex-col overflow-hidden border-2 border-border hover:border-primary/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <CardHeader className="pb-3 relative bg-primary/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 pr-12 flex-1 min-w-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(entry);
                        }}
                        className="focus:outline-none transition-all duration-200 active:scale-125 hover:scale-110 shrink-0"
                      >
                        <Star 
                          className={`w-5 h-5 transition-all duration-200 ${
                            entry.is_favorite 
                              ? "fill-primary text-primary drop-shadow-md" 
                              : "text-muted-foreground/30 hover:text-primary"
                          }`} 
                        />
                      </button>
                      <CardTitle className="text-xl font-bold truncate text-foreground">
                        {entry.title?.slice(0, 20) +  "..."  || 'Untitled'}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/20 hover:text-primary" 
                        onClick={() => handleOpenEdit(entry)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/20" 
                        onClick={() => handleDelete(entry._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-5 pb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                    {entry.content.slice(0, 150) + " ..."}
                  </p>

                  <div className="space-y-4 mt-auto">
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <span 
                            key={`${tag}-${index}`} 
                            className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-3 py-1.5 rounded-full font-bold border border-primary/40 shadow-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {(entry.sentiment_score ?? 0) !== 0 && (
                      <div className={`pt-4 flex items-center justify-between p-3 rounded-lg border-2 border-primary/20 bg-primary/5`}>
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-lg">{getSentimentEmoji(entry.sentiment_score ?? 0)}</span>
                          Mindset Check
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-card text-foreground">
                          {((entry.sentiment_score ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-3xl bg-primary/5 backdrop-blur-sm">
            <div className="text-7xl mb-6 animate-bounce">🌱</div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Your garden is quiet
            </h2>
            <p className="text-muted-foreground mb-8 text-center max-w-md text-lg">
              Every story begins with a single seed. Plant your first entry today.
            </p>
            <Button 
              onClick={handleOpenCreate} 
              className="rounded-full px-10 py-6 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Writing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}