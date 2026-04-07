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
    <div className="space-y-8">
      {/* Header + Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Analytics & Insights
          </h1>
          <p className="text-muted-foreground">
            Understand your wellness patterns
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
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Error */}
      {loading.error && (
        <div className="text-destructive text-sm">
          {loading.error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex gap-2">
              <Target className="w-4 h-4" />
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.total_mood_entries || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              last {days} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex gap-2">
              <TrendingUp className="w-4 h-4" />
              Average Mood
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary?.average_mood
                ? summary.average_mood.toFixed(1)
                : '—'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex gap-2">
              <Flame className="w-4 h-4" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {streaks.length
                ? Math.max(...streaks.map((s) => s.current))
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* ✅ Trends */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.mood_trend?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={summary.mood_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 10]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value" // ✅ FIXED
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">
                  No trend data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ Emotions */}
        <TabsContent value="emotions">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
            </CardHeader>
            <CardContent>
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
                <p className="text-center text-muted-foreground">
                  No emotion data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ✅ Streaks */}
        <TabsContent value="streaks">
          <div className="grid md:grid-cols-2 gap-4">
            {streaks.map((s) => (
              <Card key={s.type}>
                <CardHeader>
                  <CardTitle>{s.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>🔥 Current: {s.current}</p>
                  <p>🏆 Longest: {s.longest}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {summary?.top_emotions?.length
              ? `Top emotions: ${summary.top_emotions.join(', ')}`
              : 'Start logging moods to see insights'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}