'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AnalyticsSummary, EmotionTrend, Streak } from '@/lib/types';
import { TrendingUp, Fire, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [emotions, setEmotions] = useState<EmotionTrend[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [summaryRes, emotionsRes, streaksRes] = await Promise.all([
        analyticsApi.getSummary(30),
        analyticsApi.getEmotionTrends(30),
        analyticsApi.getStreaks(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data as AnalyticsSummary);
      }

      if (emotionsRes.success && emotionsRes.data) {
        setEmotions(
          Array.isArray(emotionsRes.data)
            ? emotionsRes.data
            : [emotionsRes.data as EmotionTrend]
        );
      }

      if (streaksRes.success && streaksRes.data) {
        setStreaks(
          Array.isArray(streaksRes.data)
            ? streaksRes.data
            : [streaksRes.data as Streak]
        );
      }
    } catch (err) {
      console.error('[v0] Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-2">
            Loading your wellness data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
        <p className="text-muted-foreground mt-2">
          Understand your wellness patterns and celebrate your progress
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Total Entries (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {summary?.total_mood_entries || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">mood + journal entries</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Average Mood Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {summary?.average_mood?.toFixed(1) || '0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">out of 10</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Fire className="w-4 h-4" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {streaks.reduce((max, s) => Math.max(max, s.current), 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="trends">Mood Trends</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>30-Day Mood Trend</CardTitle>
              <CardDescription>Your emotional wellness journey</CardDescription>
            </CardHeader>
            <CardContent>
              {summary?.mood_trend && summary.mood_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={summary.mood_trend}>
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
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Emotion Distribution</CardTitle>
                <CardDescription>Most prevalent emotions</CardDescription>
              </CardHeader>
              <CardContent>
                {emotions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={emotions}
                        dataKey="count"
                        nameKey="emotion"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {emotions.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No emotion data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Emotion Breakdown</CardTitle>
                <CardDescription>Detailed emotion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                {emotions.length > 0 ? (
                  <div className="space-y-4">
                    {emotions.map((emotion, index) => (
                      <div key={emotion.emotion} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{emotion.emotion}</span>
                          <span className="text-muted-foreground">{emotion.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${emotion.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No emotion data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {streaks.map((streak) => (
              <Card key={streak.type} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <Fire className="w-5 h-5 text-accent" />
                    {streak.type} Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Current Streak</p>
                    <p className="text-4xl font-bold text-primary">{streak.current}</p>
                    <p className="text-sm text-muted-foreground mt-1">consecutive days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Longest Streak</p>
                    <p className="text-4xl font-bold text-secondary">{streak.longest}</p>
                    <p className="text-sm text-muted-foreground mt-1">days</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Your Wellness Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Top Emotions</h3>
            <p className="text-muted-foreground">
              {summary?.top_emotions && summary.top_emotions.length > 0
                ? `Your most frequent emotions are: ${summary.top_emotions.slice(0, 3).join(', ')}`
                : 'Keep logging your moods and journal entries to see your emotional patterns'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Progress</h3>
            <p className="text-muted-foreground">
              You&apos;ve logged {summary?.total_mood_entries || 0} entries and maintained your wellness tracking.
              Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
