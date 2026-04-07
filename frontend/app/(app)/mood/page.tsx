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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Track your emotional patterns
        </p>
      </div>

      {/* Error */}
      {loading.error && (
        <div className="text-destructive text-sm">
          {loading.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log Mood</CardTitle>
            <CardDescription>How do you feel?</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitState.error && (
                <Alert>
                  <AlertDescription>
                    {submitState.error}
                  </AlertDescription>
                </Alert>
              )}

              {submitState.success && (
                <Alert>
                  <AlertDescription>
                    {submitState.success}
                  </AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel>Mood</FieldLabel>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={mood}
                    onChange={(e) =>
                      setMood(parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="text-center text-xl">
                    {getMoodEmoji(mood)} {mood}/10
                  </div>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel>Note</FieldLabel>
                  <Textarea
                    value={note}
                    onChange={(e) =>
                      setNote(e.target.value)
                    }
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full"
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>30-Day Trends</CardTitle>
          </CardHeader>

          <CardContent>
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="average_mood"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center">
                No data yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>

        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className="flex justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">
                      {entry.mood_score}/10
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-2xl">
                    {getMoodEmoji(entry.mood_score)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No entries yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}