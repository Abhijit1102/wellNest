'use client';

import { useEffect, useState } from 'react';
import { moodApi } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ✅ Types aligned with backend
type MoodEntry = {
  _id: string;
  mood_score: number;
  notes?: string;
  created_at: string;
};

type MoodResponse = {
  entries: MoodEntry[];
};

type Trend = {
  date: string;
  average_mood: number;
};

type AnalyticsResponse = {
  trends: Trend[];
};

type LoadingState = {
  isLoading: boolean;
  error: string | null;
};

export default function MoodPage() {
  const [mood, setMood] = useState<number>(5);
  const [note, setNote] = useState('');

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);

  const [loading, setLoading] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });

  const [submitState, setSubmitState] = useState({
    isLoading: false,
    success: '',
    error: '',
  });

  // ✅ Load data
  useEffect(() => {
    const loadMoodData = async () => {
      try {
        setLoading({ isLoading: true, error: null });

        const entriesRes = await moodApi.getMoods(30);
        const analyticsRes = await moodApi.getMoodAnalytics(30);

        // Handle Entries
        if (entriesRes?.success && entriesRes?.data) {
          const data = entriesRes.data as MoodResponse;
          setEntries(data.entries || []);
        }

        // Handle Analytics
        if (analyticsRes?.success && analyticsRes?.data) {
          const data = analyticsRes.data as AnalyticsResponse;
          setTrends(data.trends || []);
        }

        setLoading({ isLoading: false, error: null });
      } catch (err) {
        console.error('[MoodPage Error]:', err);

        setLoading({
          isLoading: false,
          error: 'Failed to load mood data',
        });
      }
    };

    loadMoodData();
  }, []);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitState({ isLoading: true, success: '', error: '' });

    try {
      const res = await moodApi.createMood(mood, note);

      if (res.success) {
        setSubmitState({
          isLoading: false,
          success: 'Mood logged successfully!',
          error: '',
        });

        setMood(5);
        setNote('');

        // Refresh data
        const updated = await moodApi.getMoods(30);
        if (updated.success && updated.data) {
          const data = updated.data as MoodResponse;
          setEntries(data.entries || []);
        }
      } else {
        setSubmitState({
          isLoading: false,
          success: '',
          error: res.error || 'Failed to log mood',
        });
      }
    } catch (err) {
      setSubmitState({
        isLoading: false,
        success: '',
        error: 'Something went wrong',
      });
    }
  };

  // ✅ Emoji helper
  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😔';
    if (value <= 4) return '😐';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '😄';
  };

  // ✅ Loading UI
  if (loading.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-60"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-100">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-playfair">
              Mood Tracker
            </h1>
            <p className="text-muted-foreground text-lg font-roboto-condensed">
              Track your emotional patterns and discover insights
            </p>
          </div>
        </div>

        {/* Error */}
        {loading.error && (
          <div className="rounded-lg bg-rose-50 border-2 border-rose-200 p-4 text-rose-600 text-sm font-medium">
            {loading.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-1 border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="font-playfair text-emerald-900">Log Your Mood</CardTitle>
              <CardDescription className="text-emerald-700/70">How do you feel right now?</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitState.error && (
                  <Alert className="bg-rose-50 border-rose-200 text-rose-600">
                    <AlertDescription className="font-medium">
                      {submitState.error}
                    </AlertDescription>
                  </Alert>
                )}

                {submitState.success && (
                  <Alert className="bg-emerald-50 border-emerald-200 text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertDescription className="font-medium flex items-center gap-2">
                      ✨ {submitState.success}
                    </AlertDescription>
                  </Alert>
                )}

                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-emerald-900 font-bold">Mood Level</FieldLabel>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mood}
                      onChange={(e) =>
                        setMood(parseInt(e.target.value))
                      }
                      className="w-full accent-emerald-600"
                    />
                    <div className="text-center text-3xl font-playfair mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                      {getMoodEmoji(mood)} <span className="text-emerald-700 font-bold">{mood}/10</span>
                    </div>
                  </Field>
                </FieldGroup>

                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-emerald-900 font-bold">Notes (Optional)</FieldLabel>
                    <Textarea
                      placeholder="Share what's on your mind today..."
                      value={note}
                      onChange={(e) =>
                        setNote(e.target.value)
                      }
                      className="border-2 focus:border-emerald-500 focus-visible:ring-emerald-500"
                    />
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl"
                  disabled={submitState.isLoading}
                >
                  {submitState.isLoading
                    ? 'Logging...'
                    : 'Log Mood'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2 border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="font-playfair text-emerald-900">30-Day Mood Trends</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 10]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '2px solid rgb(16,185,129)' }} />
                    <Line
                      type="monotone"
                      dataKey="average_mood"
                      stroke="rgb(5,150,105)"
                      strokeWidth={3}
                      dot={{ fill: 'rgb(5,150,105)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No data yet — start logging your mood to see trends!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Entries */}
        <Card className="border-2 border-emerald-200">
          <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
            <CardTitle className="font-playfair text-emerald-900">Recent Entries</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            {entries.length > 0 ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry._id}
                    className="flex justify-between items-center p-4 border-2 border-emerald-100 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                  >
                    <div>
                      <p className="font-bold text-emerald-700 text-lg">
                        {entry.mood_score}/10
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.notes}
                        </p>
                      )}
                      <p className="text-xs text-emerald-600/60 mt-2">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="text-4xl">
                      {getMoodEmoji(entry.mood_score)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🌱</div>
                <p className="text-muted-foreground font-medium">
                  No entries yet — start tracking your mood above!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}