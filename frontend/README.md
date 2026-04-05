# WellNest Frontend

A modern, nature-inspired mental health companion web application built with Next.js 16, React 19, and TypeScript.

## Features

- **User Authentication**: Secure login, registration, and password reset
- **Mood Tracking**: Log daily mood with visual trends and analytics
- **Journal Entries**: Write and reflect with AI-powered insights
- **AI Chat Interface**: Real-time conversations with your wellness coach
- **Analytics Dashboard**: Comprehensive reports on emotional patterns and progress
- **Beautiful UI**: Nature-themed design with accessible components

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui with Radix UI primitives
- **Charts**: Recharts for data visualization
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm 8+
- Access to WellNest backend API (running on `http://localhost:8000`)

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

3. **Start the development server**:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (app)/                 # Protected routes with authenticated layout
│   ├── dashboard/         # Main dashboard with quick stats
│   ├── mood/             # Mood tracking interface
│   ├── journal/          # Journal entries and prompts
│   ├── chat/             # AI wellness coach conversation
│   ├── analytics/        # Reports and insights
│   ├── settings/         # User settings and profile
│   └── layout.tsx        # Authenticated app layout
├── auth/                  # Public authentication routes
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── page.tsx              # Root redirect to dashboard or login
└── globals.css           # Global styles and design tokens

lib/
├── api.ts                # API client and endpoints
├── store.ts              # Zustand store for auth state
└── types.ts              # TypeScript type definitions

components/
├── ui/                   # shadcn/ui components
├── app-sidebar.tsx       # Navigation sidebar
└── [other components]

hooks/
├── useProtectedRoute.ts  # Route protection hook
└── [other custom hooks]
```

## API Integration

The frontend communicates with the WellNest backend API at:
```
http://localhost:8000/api/v1
```

### Available Endpoints

#### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Verify token validity
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password

#### User Profile
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

#### Mood Tracking
- `GET /moods` - Get mood entries
- `POST /moods` - Create new mood entry
- `GET /moods/analytics` - Get mood analytics

#### Journal
- `GET /journal` - Get journal entries
- `POST /journal` - Create new entry
- `PUT /journal/{id}` - Update entry
- `DELETE /journal/{id}` - Delete entry
- `GET /journal/prompt` - Get writing prompt

#### Chat
- `POST /chat/message` - Send chat message
- `GET /chat/conversations` - Get conversations
- `POST /chat/conversations` - Create new conversation
- `GET /chat/conversations/{id}` - Get conversation

#### Analytics
- `GET /analytics/summary` - Get wellness summary
- `GET /analytics/emotion-trends` - Get emotion trends
- `GET /analytics/streaks` - Get streaks

## Design System

### Color Palette

The app uses a nature-inspired color palette:
- **Primary**: Forest green for wellness and growth
- **Secondary**: Sage green for calm and balance
- **Accent**: Warm earth tone for highlights
- **Neutrals**: Soft whites, grays, and dark tones

Colors are defined as CSS custom properties in `app/globals.css` and use OKLch color space for better color accuracy.

### Typography

- **Headings**: Geist (sans-serif)
- **Body**: Geist (sans-serif)
- **Monospace**: Geist Mono

## Authentication Flow

1. User visits the app
2. Redirected to login if not authenticated
3. After login, token is stored in localStorage and sent with API requests
4. Protected routes use `useProtectedRoute()` hook
5. Auth state is managed globally with Zustand

## Development

### Build for production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

### Format code
```bash
pnpm format
```

## Security Features

- **Token Management**: JWT tokens stored securely
- **Protected Routes**: Client-side route protection for authenticated pages
- **CORS**: API calls with proper headers
- **Input Validation**: Form validation with Zod
- **Error Handling**: Comprehensive error messages

## Performance Optimizations

- Server-side rendering where appropriate
- Image optimization
- Code splitting by route
- Caching of API responses
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a personal wellness project. For issues or improvements, please contact the development team.

## License

MIT License - See LICENSE file for details

## Support

For technical issues or feature requests, reach out to the WellNest team.

---

**Remember**: WellNest is a support tool, not a replacement for professional mental health care. If you're in crisis, please reach out to a mental health professional or crisis helpline.
