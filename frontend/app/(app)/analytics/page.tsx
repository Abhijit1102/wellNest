'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Flame, Target } from 'lucide-react';

// ✅ Types (FIXED)
type MoodTrend = {
  date: string;
  value: number; // ✅ backend sends "value", not "average_mood"
};

type AnalyticsSummary = {
  average_mood: number;
  total_mood_entries: number;
  mood_trend: MoodTrend[];
  top_emotions: string[];
};

type EmotionTrend = {
  emotion: string;
  count: number;
  percentage: number;
};

type Streak = {
  type: string;
  current: number;
  longest: number;
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [emotions, setEmotions] = useState<EmotionTrend[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);

  const [loading, setLoading] = useState({
    isLoading: true,
    error: null as string | null,
  });

  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  // ✅ Fetch Data (dynamic)
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading({ isLoading: true, error: null });

        const [summaryRes, emotionsRes, streaksRes] = await Promise.all([
          analyticsApi.getSummary(days),
          analyticsApi.getEmotionTrends(days),
          analyticsApi.getStreaks(),
        ]);

        if (summaryRes?.success && summaryRes?.data) {
          setSummary(summaryRes.data as AnalyticsSummary);
        }

        if (emotionsRes?.success) {
          setEmotions(
            Array.isArray(emotionsRes.data)
              ? emotionsRes.data
              : []
          );
        }

        if (streaksRes?.success) {
          setStreaks(
            Array.isArray(streaksRes.data)
              ? streaksRes.data
              : []
          );
        }

        setLoading({ isLoading: false, error: null });
      } catch (err) {
        console.error(err);
        setLoading({
          isLoading: false,
          error: 'Failed to load analytics',
        });
      }
    };

    loadAnalytics();
  }, [days]); // ✅ refetch on change

  if (loading.isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
        <div className="h-72 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-white to-green-50/40">
      <div className="container max-w-7xl mx-auto py-10 px-4 space-y-8">
        {/* Header + Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-emerald-100">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent font-playfair">
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground text-lg font-roboto-condensed">
              Understand your wellness patterns and growth
            </p>
          </div>

          {/* ✅ Days Filter */}
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

        {/* Error */}
        {loading.error && (
          <div className="rounded-lg bg-rose-50 border-2 border-rose-200 p-4 text-rose-600 text-sm font-medium">
            {loading.error}
          </div>
        )}

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm flex gap-2 font-bold text-emerald-700 font-roboto-condensed">
                <Target className="w-4 h-4" />
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-emerald-700">
                {summary?.total_mood_entries || 0}
              </p>
              <p className="text-xs text-muted-foreground">
                last {days} days
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm flex gap-2 font-bold text-emerald-700 font-roboto-condensed">
                <TrendingUp className="w-4 h-4" />
                Average Mood
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-emerald-700">
                {summary?.average_mood
                  ? summary.average_mood.toFixed(1)
                  : '—'}
              </p>
              <p className="text-xs text-muted-foreground">out of 10</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
              <CardTitle className="text-sm flex gap-2 font-bold text-emerald-700 font-roboto-condensed">
                <Flame className="w-4 h-4" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-emerald-700">
                {streaks.length
                  ? Math.max(...streaks.map((s) => s.current))
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="trends">
          <TabsList className="bg-emerald-100">
            <TabsTrigger value="trends" className="data-[state=active]:bg-white">Trends</TabsTrigger>
            <TabsTrigger value="emotions" className="data-[state=active]:bg-white">Emotions</TabsTrigger>
            <TabsTrigger value="streaks" className="data-[state=active]:bg-white">Streaks</TabsTrigger>
          </TabsList>

          {/* ✅ Trends */}
          <TabsContent value="trends">
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                <CardTitle className="font-playfair text-emerald-900">Mood Trend</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {summary?.mood_trend?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={summary.mood_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 10]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '2px solid rgb(16,185,129)' }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="rgb(5,150,105)"
                        strokeWidth={3}
                        dot={{ fill: 'rgb(5,150,105)', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No trend data yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Emotions */}
          <TabsContent value="emotions">
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                <CardTitle className="font-playfair text-emerald-900">Emotion Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {emotions.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={emotions}
                        dataKey="count"
                        nameKey="emotion"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {emotions.map((_, i) => (
                          <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No emotion data yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ Streaks */}
          <TabsContent value="streaks">
            <div className="grid md:grid-cols-2 gap-6">
              {streaks.map((s) => (
                <Card key={s.type} className="border-2 border-emerald-200">
                  <CardHeader className="bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                    <CardTitle className="text-emerald-900 font-playfair">{s.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-lg font-bold text-emerald-700">🔥 Current: {s.current}</p>
                    <p className="text-lg font-bold text-emerald-700 mt-2">🏆 Longest: {s.longest}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50">
          <CardHeader>
            <CardTitle className="text-emerald-900 font-playfair">🌟 Your Insights</CardTitle>
          </CardHeader>
          <CardContent className="text-emerald-700">
            <p className="font-medium">
              {summary?.top_emotions?.length
                ? `Your top emotions: ${summary.top_emotions.join(', ')}`
                : 'Start logging moods to see personalized insights about your emotional patterns'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}