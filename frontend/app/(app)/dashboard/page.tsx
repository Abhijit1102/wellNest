'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { moodApi, analyticsApi } from '@/lib/api';
import { LoadingState } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });
  const { error } = loading;
  const [stats, setStats] = useState({
    today_mood: null as number | null,
    average_mood: 0,
    total_entries: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const moods = await moodApi.getMoods(1);
        const analytics = await analyticsApi.getSummary(7);

        if (moods.success && moods.data) {
          const moodArray = Array.isArray(moods.data) ? moods.data : [];
          const todayMood = moodArray.length > 0 ? (moodArray[0] as any).mood_value : null;
          setStats((prev) => ({ ...prev, today_mood: todayMood }));
        }

        if (analytics.success && analytics.data) {
          const analyticsData = analytics.data as any;
          setStats((prev) => ({
            ...prev,
            average_mood: analyticsData.average_mood || 0,
            total_entries: analyticsData.total_mood_entries || 0,
          }));
        }

        setLoading({ isLoading: false, error: null });
      } catch (error) {
        console.error('[v0] Failed to load dashboard:', error);
        setLoading({
          isLoading: false,
          error: 'Failed to load dashboard data',
        });
      }
    };

    loadDashboard();
  }, []);

  const getMoodEmoji = (mood: number | null) => {
    if (mood === null) return '—';
    if (mood <= 2) return '😔';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your wellness dashboard — track your mental health journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl">{getMoodEmoji(stats.today_mood)}</div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.today_mood !== null ? stats.today_mood : '—'}
                </p>
                <p className="text-xs text-muted-foreground">out of 10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              7-Day Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.average_mood.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">mood score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total_entries}
                </p>
                <p className="text-xs text-muted-foreground">this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/mood">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
            >
              <Smile className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Log Mood</span>
            </Button>
          </Link>

          <Link href="/journal">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
            >
              <BookOpen className="w-6 h-6 text-secondary" />
              <span className="text-sm font-medium">Write Journal</span>
            </Button>
          </Link>

          <Link href="/chat">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 border-primary/20 hover:bg-primary/5"
            >
              <MessageCircle className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium">Chat</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Wellness Tips */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Wellness Tip of the Day</CardTitle>
          <CardDescription>
            Taking just 5 minutes for deep breathing can significantly reduce stress and anxiety.
            Try the 4-7-8 technique: breathe in for 4 counts, hold for 7, exhale for 8.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
