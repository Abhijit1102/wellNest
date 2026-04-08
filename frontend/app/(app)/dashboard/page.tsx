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
import { Smile, BookOpen, MessageCircle, TrendingUp, Loader2 } from 'lucide-react';
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
      <div className="space-y-8 animate-pulse p-4">
        <div>
          <div className="h-9 bg-muted rounded w-64 mb-2"></div>
          <div className="h-5 bg-muted rounded w-96"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-foreground font-playfair">
              Welcome back, {user?.full_name || 'User'}
            </h1>
            <p className="text-muted-foreground text-lg font-roboto-condensed">
              Your wellness dashboard — track your mental health journey
            </p>
          </div>
        </div>

        {/* Error */}
        {loading.error && (
          <div className="rounded-lg bg-destructive/10 border-2 border-destructive/30 p-4 text-destructive text-sm font-medium">
            {loading.error}
          </div>
        )}

        {/* ✅ Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-roboto-condensed text-muted-foreground">Overview</h2>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
                className={`text-xs`}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today Mood */}
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-sm text-foreground font-roboto-condensed font-bold">
                Today&apos;s Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center pt-6">
              <div className="text-5xl">
                {getMoodEmoji(stats.today_mood)}
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  {stats.today_mood ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">out of 10</p>
              </div>
            </CardContent>
          </Card>

          {/* Average */}
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-sm text-foreground font-roboto-condensed font-bold">
                {days}-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 items-center pt-6">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-3xl font-bold text-primary">
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
          <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-sm text-foreground font-roboto-condensed font-bold">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 items-center pt-6">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-3xl font-bold text-primary">
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
          <h2 className="text-2xl font-bold mb-4 font-playfair text-foreground">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/mood">
              <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Smile className="w-6 h-6" />
                Mood
              </Button>
            </Link>

            <Link href="/journal">
              <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <BookOpen className="w-6 h-6" />
                Journal
              </Button>
            </Link>

            <Link href="/chat">
              <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <MessageCircle className="w-6 h-6" />
                Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Wellness Tip */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-foreground font-playfair">🌿 Wellness Tip</CardTitle>
            <CardDescription className="text-muted-foreground">
              Take 5 minutes for deep breathing. Try 4-7-8 technique: breathe in for 4, hold for 7, exhale for 8.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}