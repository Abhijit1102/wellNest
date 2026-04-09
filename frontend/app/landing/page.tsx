'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: '🧠',
    title: 'AI Mental Health Companion',
    description:
      'Chat with an empathetic AI trained on evidence-based therapy techniques. Available 24/7 whenever you need support.',
  },
  {
    icon: '📓',
    title: 'Guided Journaling',
    description:
      'Structured prompts and free-form writing space to help you process emotions and gain deeper self-awareness.',
  },
  {
    icon: '🌡️',
    title: 'Mood Tracking',
    description:
      'Log how you feel throughout the day and discover patterns in your emotional well-being over time.',
  },
  {
    icon: '📊',
    title: 'Wellness Analytics',
    description:
      'Beautiful charts and insights that reveal your mental health trends and celebrate your growth.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description:
      'Your thoughts are yours alone. End-to-end encrypted data storage with zero data sharing.',
  },
  {
    icon: '🌿',
    title: 'Holistic Approach',
    description:
      'Evidence-based exercises rooted in CBT, mindfulness, and positive psychology — all in one place.',
  },
];

const testimonials = [
  {
    avatar: '👩‍💼',
    name: 'Sarah M.',
    role: 'Marketing Lead',
    quote:
      "WellNest helped me recognize stress patterns I didn't even know I had. The AI conversations feel genuinely supportive.",
  },
  {
    avatar: '🧑‍💻',
    name: 'James T.',
    role: 'Software Engineer',
    quote:
      'After months of journaling with WellNest, I finally feel like I understand my anxiety triggers and how to manage them.',
  },
  {
    avatar: '👩‍🎨',
    name: 'Priya K.',
    role: 'UX Designer',
    quote:
      'The mood analytics are eye-opening. Seeing my emotional data visualised made it so much easier to talk to my therapist.',
  },
];

const stats = [
  { value: '50K+', label: 'Happy Users' },
  { value: '2M+', label: 'Journal Entries' },
  { value: '98%', label: 'Feel Supported' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>(
    new Array(features.length).fill(false)
  );
  const { isAuthenticated, token } = useAuthStore();
  const isLoggedIn = isAuthenticated || !!token;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(
              (entry.target as HTMLElement).dataset.idx ?? '0'
            );
            setVisibleFeatures((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAVIGATION ─────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="WellNest logo"
                width={32}
                height={32}
              />
              <span className="text-2xl font-bold font-lobster text-primary">
                WellNest
              </span>
            </Link>

            <ul className="hidden md:flex items-center gap-8">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Stories
                </a>
              </li>
              <li>
                <a
                  href="#stats"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Impact
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    Go to Dashboard →
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="hidden sm:inline-flex">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 animate-pulse delay-1000" />
        </div>

        <div className="container max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary animate-fadeIn">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Trusted by 50,000+ people worldwide
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-playfair animate-fadeIn">
              Your Mental Wellness,{' '}
              <span className="text-primary">Reimagined</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-roboto-condensed animate-fadeIn delay-100">
              WellNest combines AI-powered conversations, mood tracking, and
              guided journaling into one beautiful sanctuary — designed to help
              you thrive, not just cope.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn delay-200">
              <Link href="/auth/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all px-8 py-6 text-lg">
                  Start Your Journey
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Button>
              </Link>
              <a href="#features">
                <Button
                  variant="outline"
                  className="border-2 border-primary/20 hover:bg-primary/5 px-8 py-6 text-lg"
                >
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Floating preview cards */}
            <div className="relative mt-16 grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                <CardContent className="flex items-center gap-3 pt-6">
                  <span className="text-3xl">😊</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Today&apos;s Mood</p>
                    <p className="font-bold">Feeling Great!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                <CardContent className="flex items-center gap-3 pt-6">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-xs text-muted-foreground">Journal Streak</p>
                    <p className="font-bold">14 Days</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card/50 backdrop-blur">
                <CardContent className="flex items-center gap-3 pt-6">
                  <span className="text-3xl">💡</span>
                  <div>
                    <p className="text-xs text-muted-foreground">AI Insight</p>
                    <p className="font-bold">You&apos;re growing!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────────────── */}
      <section id="stats" className="py-20 bg-primary/5 border-y border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary font-playfair mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-roboto-condensed text-primary uppercase tracking-wider mb-3">
              Everything You Need
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-4">
              A Complete Wellness Ecosystem
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every tool thoughtfully crafted to support your mental health
              journey from day one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                className={`feature-card border-2 border-primary/20 hover:shadow-lg hover:scale-105 transition-all duration-300 bg-card ${
                  visibleFeatures[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                data-idx={i}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <CardHeader className="bg-primary/5">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <CardTitle className="text-foreground font-roboto-condensed">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 bg-primary/5">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-roboto-condensed text-primary uppercase tracking-wider mb-3">
              Simple as 1-2-3
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-playfair">
              Start in Under a Minute
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Create Your Free Account',
                desc: 'Sign up in seconds. No credit card needed.',
              },
              {
                num: '02',
                title: 'Set Your Wellness Goals',
                desc: 'Tell WellNest what matters most to you right now.',
              },
              {
                num: '03',
                title: 'Begin Your Journey',
                desc: 'Chat, journal, track — your sanctuary awaits.',
              },
            ].map((step) => (
              <Card
                key={step.num}
                className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card"
              >
                <CardHeader>
                  <div className="text-5xl font-bold text-primary font-playfair mb-4">
                    {step.num}
                  </div>
                  <CardTitle className="font-roboto-condensed">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {step.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section id="testimonials" className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-roboto-condensed text-primary uppercase tracking-wider mb-3">
              Real Stories
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-playfair">
              Lives Changed by WellNest
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="border-2 border-primary/20 hover:shadow-lg transition-shadow bg-card"
              >
                <CardHeader>
                  <CardDescription className="text-base italic text-foreground leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────────── */}
      <section className="py-24 bg-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair mb-6">
            Ready to Nurture Your Mind?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands who&apos;ve chosen WellNest as their mental wellness
            companion. It&apos;s free to start.
          </p>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all px-10 py-7 text-xl">
              Create Your Free Account
              <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="WellNest" width={24} height={24} />
              <span className="text-xl font-bold font-lobster text-primary">
                WellNest
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WellNest. Built with 💚 for your
              wellbeing.
            </p>

            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}