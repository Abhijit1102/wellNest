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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-100">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-playfair">
              Welcome back, {user?.full_name || 'User'}
            </h1>
            <p className="text-muted-foreground text-lg font-roboto-condensed">
              Your wellness dashboard — track your mental health journey
            </p>
          </div>
        </div>

        {/* Error */}
        {loading.error && (
          <div className="rounded-lg bg-rose-50 border-2 border-rose-200 p-4 text-rose-600 text-sm font-medium">
            {loading.error}
          </div>
        )}

        {/* ✅ Filter */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-roboto-condensed text-emerald-900/70">Overview</h2>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
                className={`text-xs ${days === d ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today Mood */}
          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm text-emerald-700 font-roboto-condensed font-bold">
                Today&apos;s Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center pt-6">
              <div className="text-5xl">
                {getMoodEmoji(stats.today_mood)}
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-700">
                  {stats.today_mood ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">out of 10</p>
              </div>
            </CardContent>
          </Card>

          {/* Average */}
          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm text-emerald-700 font-roboto-condensed font-bold">
                {days}-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 items-center pt-6">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-3xl font-bold text-emerald-700">
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
          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm text-emerald-700 font-roboto-condensed font-bold">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 items-center pt-6">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold text-emerald-700">
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
          <h2 className="text-2xl font-bold mb-4 font-playfair text-emerald-900">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/mood">
              <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white">
                <Smile className="w-6 h-6" />
              </Button>
            </Link>

            <Link href="/journal">
              <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white">
                <BookOpen className="w-6 h-6" />
                Journal
              </Button>
            </Link>

            <Link href="/chat">
              <Button className="w-full h-24 flex flex-col gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white">
                <MessageCircle className="w-6 h-6" />
                Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Wellness Tip */}
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 font-playfair">🌿 Wellness Tip</CardTitle>
            <CardDescription className="text-emerald-700/70">
              Take 5 minutes for deep breathing. Try 4-7-8 technique: breathe in for 4, hold for 7, exhale for 8.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}