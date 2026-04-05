'use client';

import { useState, useEffect } from 'react';
import { moodApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodEntry, MoodAnalytics } from '@/lib/types';

export default function MoodPage() {
  const [mood, setMood] = useState<number>(5);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [analytics, setAnalytics] = useState<MoodAnalytics | null>(null);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const entriesRes = await moodApi.getMoods(30);
      const analyticsRes = await moodApi.getMoodAnalytics(30);

      if (entriesRes.success && entriesRes.data) {
        setEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      }

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data as MoodAnalytics);
      }
    } catch (err) {
      console.error('[v0] Failed to load mood data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await moodApi.createMood(mood, note);
      if (response.success) {
        setSuccess('Mood logged successfully!');
        setMood(5);
        setNote('');
        setTimeout(() => setSuccess(''), 3000);
        await loadMoodData();
      } else {
        setError(response.error || 'Failed to log mood');
      }
    } catch (err) {
      setError('An error occurred while logging mood');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = analytics?.trends || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mood Tracker</h1>
        <p className="text-muted-foreground mt-2">
          Track your daily mood and recognize patterns in your emotional wellness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Logging Form */}
        <Card className="border-primary/20 lg:col-span-1">
          <CardHeader>
            <CardTitle>Log Your Mood</CardTitle>
            <CardDescription>How are you feeling today?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <FieldGroup>
                <Field>
                  <FieldLabel>Mood Level</FieldLabel>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={mood}
                      onChange={(e) => setMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Not great</span>
                      <span className="text-2xl font-bold text-primary">{mood}</span>
                      <span className="text-sm text-muted-foreground">Excellent</span>
                    </div>
                    <div className="text-center text-3xl pt-2">
                      {mood <= 2 && '😔'}
                      {mood === 3 && '😕'}
                      {mood === 4 && '😐'}
                      {mood === 5 && '🙂'}
                      {mood === 6 && '😊'}
                      {mood === 7 && '😄'}
                      {mood === 8 && '😊'}
                      {mood === 9 && '😄'}
                      {mood === 10 && '🎉'}
                    </div>
                  </div>
                </Field>
              </FieldGroup>

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="note">Add a note (optional)</FieldLabel>
                  <Textarea
                    id="note"
                    placeholder="What's on your mind? What triggered this mood?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isLoading}
                    className="min-h-24"
                  />
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Logging...' : 'Log Mood'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mood Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trend Chart */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Mood Trends (30 Days)</CardTitle>
              <CardDescription>Your emotional wellness pattern</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <YAxis domain={[1, 10]} stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="average_mood"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No mood data yet. Start logging to see trends.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your mood history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          Mood: {entry.mood_value}/10
                        </p>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-3xl ml-4">
                        {entry.mood_value <= 2 && '😔'}
                        {entry.mood_value === 3 && '😕'}
                        {entry.mood_value === 4 && '😐'}
                        {entry.mood_value === 5 && '🙂'}
                        {entry.mood_value === 6 && '😊'}
                        {entry.mood_value === 7 && '😄'}
                        {entry.mood_value === 8 && '😊'}
                        {entry.mood_value === 9 && '😄'}
                        {entry.mood_value === 10 && '🎉'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No entries yet. Log your mood to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
