'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, BookOpen, MessageCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { moodApi, analyticsApi } from '@/lib/api';
import { LoadingState } from '@/lib/types';

// ✅ Types
type MoodEntry = {
  _id: string;
  user_id: string;
  date: string;
  mood_score: number;
  emotions: string[];
  energy_level?: number | null;
  sleep_hours?: number | null;
  activities: string[];
  notes?: string;
  created_at: string;
};

type MoodResponse = {
  entries: MoodEntry[];
  total: number;
};

type AnalyticsResponse = {
  average_mood: number;
  total_mood_entries: number;
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const [days, setDays] = useState(7); // ✅ dynamic filter

  const [loading, setLoading] = useState<LoadingState>({
    isLoading: true,
    error: null,
  });

  const [stats, setStats] = useState({
    today_mood: null as number | null,
    average_mood: 0,
    total_entries: 0,
  });

  // ✅ Fetch Data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading({ isLoading: true, error: null });

        const moods = await moodApi.getMoods(1);
        const analytics = await analyticsApi.getSummary(days);

        // ✅ Mood Data
        if (moods?.success && moods?.data) {
          const moodData = moods.data as MoodResponse;
          const moodArray = moodData.entries || [];

          const todayMood =
            moodArray.length > 0 ? moodArray[0].mood_score : null;

          setStats((prev) => ({
            ...prev,
            today_mood: todayMood,
          }));
        }

        // ✅ Analytics Data
        if (analytics?.success && analytics?.data) {
          const analyticsData = analytics.data as AnalyticsResponse;

          setStats((prev) => ({
            ...prev,
            average_mood: analyticsData.average_mood || 0,
            total_entries: analyticsData.total_mood_entries || 0,
          }));
        }

        setLoading({ isLoading: false, error: null });
      } catch (error) {
        console.error('[Dashboard Error]:', error);

        setLoading({
          isLoading: false,
          error: 'Failed to load dashboard data.',
        });
      }
    };

    loadDashboard();
  }, [days]); // ✅ refetch when days changes

  // ✅ Emoji helper
  const getMoodEmoji = (mood: number | null) => {
    if (mood === null) return '—';
    if (mood <= 2) return '😔';
    if (mood <= 4) return '😐';
    if (mood <= 6) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  };

  // ✅ Loading Skeleton
  if (loading.isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.full_name || 'User'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Your wellness dashboard — track your mental health journey
        </p>
      </div>

      {/* Error */}
      {loading.error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
          {loading.error}
        </div>
      )}

      {/* ✅ Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
              className="text-xs"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today Mood */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Today&apos;s Mood
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div className="text-4xl">
              {getMoodEmoji(stats.today_mood)}
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.today_mood ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">out of 10</p>
            </div>
          </CardContent>
        </Card>

        {/* Average */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              {days}-Day Average
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 items-center">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {stats.average_mood
                  ? stats.average_mood.toFixed(1)
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                mood score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 items-center">
            <BookOpen className="w-6 h-6 text-secondary" />
            <div>
              <p className="text-2xl font-bold">
                {stats.total_entries}
              </p>
              <p className="text-xs text-muted-foreground">
                last {days} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/mood">
            <Button className="w-full h-24 flex flex-col gap-2">
              <Smile className="w-6 h-6" />
              Log Mood
            </Button>
          </Link>

          <Link href="/journal">
            <Button className="w-full h-24 flex flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              Journal
            </Button>
          </Link>

          <Link href="/chat">
            <Button className="w-full h-24 flex flex-col gap-2">
              <MessageCircle className="w-6 h-6" />
              Chat
            </Button>
          </Link>
        </div>
      </div>

      {/* Tip */}
      <Card>
        <CardHeader>
          <CardTitle>Wellness Tip</CardTitle>
          <CardDescription>
            Take 5 minutes for deep breathing. Try 4-7-8 technique.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}