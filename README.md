# WellNest - AI Mental Health Companion

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> A privacy-first, AI-powered mental health companion providing personalized support, mood tracking, journaling, and wellness analytics.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Component Deep Dive](#component-deep-dive)
  - [Backend (FastAPI + LangGraph)](#backend-fastapi--langgraph)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Database (MongoDB)](#database-mongodb)
  - [AI Service (LangGraph)](#ai-service-langgraph)
- [Development Setup](#development-setup)
- [API Documentation](#api-documentation)
- [Security & Compliance](#security--compliance)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**WellNest** is a web application that leverages generative AI to deliver personalized mental health support. The platform helps users:

- Track daily moods and emotional patterns
- Receive AI-driven journaling prompts
- Access personalized coping strategies
- Visualize progress through analytics dashboards
- Export wellness reports for healthcare providers

### Key Features

✅ **AI Chat Companion** - Context-aware conversations and support  
✅ **Mood Tracking** - Daily logging with trend visualization  
✅ **Smart Journaling** - AI-generated, personalized prompts  
✅ **Progress Analytics** - Visual dashboards and insights  
✅ **Wellness Reports** - Exportable PDF/CSV reports  
✅ **Privacy Controls** - GDPR/HIPAA compliant data management  

---

## 🏗 Architecture

WellNest follows a **modular, service-oriented architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                    (Next.js Frontend)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/REST
┌──────────────────────────▼──────────────────────────────────┐
│                      API GATEWAY                             │
│                   (FastAPI Backend)                          │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │ Auth Service │ API Routes   │ Request Validation   │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└──────┬────────────────┬────────────────┬────────────────────┘
       │                │                │
┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼─────────┐
│  LangGraph  │  │  Analytics  │  │   Reporting   │
│ AI Service  │  │   Engine    │  │    Service    │
└──────┬──────┘  └──────┬──────┘  └─────┬─────────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                ┌───────▼────────┐
                │    MongoDB     │
                │   (Database)   │
                └────────────────┘
```

### Data Flow

1. **User Interaction** → Next.js frontend captures input
2. **API Request** → FastAPI gateway authenticates and routes
3. **AI Processing** → LangGraph generates personalized responses
4. **Data Persistence** → MongoDB stores user data securely
5. **Analytics** → Engine processes data for insights
6. **Response** → Formatted data returned to frontend

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with SSR/SSG | 14.x |
| **TypeScript** | Type-safe development | 5.x |
| **Tailwind CSS** | Styling framework | 3.x |
| **Chart.js** | Data visualization | 4.x |
| **Zustand** | State management | 4.x |
| **React Hook Form** | Form handling | 7.x |
| **Axios** | HTTP client | 1.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | REST API framework | 0.109+ |
| **Python** | Backend language | 3.11+ |
| **LangGraph** | AI workflow orchestration | 0.0.45+ |
| **LangChain** | LLM integration | 0.1.0+ |
| **Pydantic** | Data validation | 2.x |
| **Motor** | Async MongoDB driver | 3.3+ |
| **PyJWT** | JWT authentication | 2.8+ |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **MongoDB** | Primary database |
| **Redis** | Session & cache storage |

### AI/ML
| Technology | Purpose |
|------------|---------|
| **OpenAI API** | LLM provider |
| **LangGraph** | AI agent orchestration |
| **LangSmith** | LLM observability (optional) |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **GitHub Actions** | CI/CD pipeline |
| **AWS/GCP** | Cloud hosting |

---

## 📁 Project Structure

```
wellnest/
├── backend/                    # FastAPI + LangGraph backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry
│   │   ├── config.py          # Environment configuration
│   │   ├── dependencies.py    # Dependency injection
│   │   │
│   │   ├── api/               # API routes
│   │   │   ├── v1/
|   |   |   |   ├── routers/ 
|   |   |   |   |     ├── healthcheck
│   │   │   │   |     ├── auth.py           # Authentication endpoints
│   │   │   │   |     ├── mood.py           # Mood tracking endpoints
│   │   │   │   |     ├── journal.py        # Journaling endpoints
│   │   │   │   |     ├── chat.py           # AI chat endpoints
│   │   │   │   |     ├── analytics.py      # Analytics endpoints
│   │   │   │   |     └── reports.py        # Report generation endpoints
│   │   │   |   └── api.py
|   |   |
│   │   ├── core/              # Core utilities
│   │   │   ├── security.py           # Auth & encryption
|   |   |   ├── logging.py            # Logger
│   │   │   ├── database.py           # DB connection
│   │   │   ├── responses.py 
|   |   |   ├── exceptions.py 
│   │   │   ├── status.py
|   |   |   └── middleware.py         # Custom middleware
|   |   |
│   │   ├── models/            # Pydantic models
│   │   │   ├── user.py
│   │   │   ├── mood.py
│   │   │   ├── journal.py
│   │   │   └── report.py
│   │   │
│   │   ├── schemas/           # Request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── mood.py
│   │   │   └── journal.py
│   │   │
│   │   ├── services/          # Business logic
│   │   │   ├── langgraph/            # LangGraph AI workflows
│   │   │   │   ├── agents/
│   │   │   │   │   ├── chat_agent.py        # Main chat agent
│   │   │   │   │   ├── journal_agent.py     # Journaling prompts
│   │   │   │   │   └── coping_agent.py      # Coping strategies
│   │   │   │   ├── graphs/
│   │   │   │   │   ├── conversation_graph.py # Chat workflow
│   │   │   │   │   └── wellness_graph.py     # Wellness workflow
│   │   │   │   └── tools/
│   │   │   │       ├── mood_analyzer.py
│   │   │   │       └── context_retriever.py
│   │   │   │
│   │   │   ├── auth_service.py
│   │   │   ├── mood_service.py
│   │   │   ├── journal_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── report_service.py
│   │   │
│   │   └── utils/             # Helper functions
│   │       ├── validators.py
│   │       ├── formatters.py
│   │       └── pdf_generator.py
│   │
│   ├── tests/                 # Backend tests
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend container
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # App router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── mood/
│   │   │   ├── journal/
│   │   │   ├── chat/
│   │   │   ├── analytics/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── components/       # React components
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   ├── charts/              # Chart components
│   │   │   ├── forms/               # Form components
│   │   │   └── layout/              # Layout components
│   │   │
│   │   ├── lib/              # Utilities
│   │   │   ├── api-client.ts        # API wrapper
│   │   │   ├── auth.ts              # Auth helpers
│   │   │   └── validators.ts        # Form validation
│   │   │
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useMood.ts
│   │   │   └── useAnalytics.ts
│   │   │
│   │   ├── store/            # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── moodStore.ts
│   │   │   └── chatStore.ts
│   │   │
│   │   └── types/            # TypeScript types
│   │       ├── api.ts
│   │       ├── user.ts
│   │       └── mood.ts
│   │
│   ├── public/               # Static assets
│   ├── package.json
│   └── Dockerfile           # Frontend container
│
├── docker-compose.yml        # Local development orchestration
├── .env.example             # Environment variables template
└── README.md               # This file
```

---

## 🔍 Component Deep Dive

### Backend (FastAPI + LangGraph)

#### **1. FastAPI Application (`app/main.py`)**

**Purpose:** Entry point for the REST API server.

**Key Responsibilities:**
- Initialize FastAPI application
- Configure CORS, middleware, and security headers
- Register API routers
- Setup database connections
- Configure error handlers

**Development Notes:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, mood, journal, chat, analytics, reports
from app.core.database import init_db

app = FastAPI(
    title="WellNest API",
    version="1.0.0",
    docs_url="/api/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Register routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(mood.router, prefix="/api/v1/mood", tags=["mood"])
# ... other routers

@app.on_event("startup")
async def startup():
    await init_db()
```

---

#### **2. LangGraph AI Service (`services/langgraph/`)**

**Purpose:** Orchestrate complex AI workflows using state graphs.

**Why LangGraph?**
- **Stateful workflows:** Maintains conversation context across interactions
- **Multi-agent orchestration:** Coordinates specialized agents (chat, journaling, coping)
- **Conditional branching:** Routes user inputs to appropriate handlers
- **Memory management:** Stores conversation history and user context

**Key Components:**

##### **a) Chat Agent (`agents/chat_agent.py`)**

Handles empathetic conversations and emotional support.

```python
from langgraph.graph import StateGraph, END
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

class ChatAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are WellNest, an empathetic mental health companion..."),
            ("human", "{input}")
        ])
    
    async def process(self, state: dict) -> dict:
        """Process user message and generate empathetic response"""
        response = await self.llm.ainvoke(
            self.prompt.format_messages(input=state["user_message"])
        )
        return {
            "response": response.content,
            "sentiment": self._analyze_sentiment(response.content)
        }
```

##### **b) Conversation Graph (`graphs/conversation_graph.py`)**

Orchestrates the chat workflow with state management.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

class ConversationState(TypedDict):
    user_id: str
    message: str
    history: list
    mood_context: dict
    response: str

def build_conversation_graph():
    workflow = StateGraph(ConversationState)
    
    # Define nodes
    workflow.add_node("retrieve_context", retrieve_user_context)
    workflow.add_node("analyze_mood", analyze_mood_from_message)
    workflow.add_node("generate_response", generate_ai_response)
    workflow.add_node("suggest_coping", suggest_coping_strategies)
    
    # Define edges (workflow)
    workflow.set_entry_point("retrieve_context")
    workflow.add_edge("retrieve_context", "analyze_mood")
    workflow.add_conditional_edges(
        "analyze_mood",
        route_by_mood,
        {
            "negative": "suggest_coping",
            "neutral": "generate_response"
        }
    )
    workflow.add_edge("generate_response", END)
    workflow.add_edge("suggest_coping", END)
    
    return workflow.compile()

# Usage in API endpoint
conversation_graph = build_conversation_graph()

async def chat_endpoint(user_id: str, message: str):
    result = await conversation_graph.ainvoke({
        "user_id": user_id,
        "message": message,
        "history": await get_chat_history(user_id),
        "mood_context": await get_recent_moods(user_id)
    })
    return result
```

##### **c) Journal Agent (`agents/journal_agent.py`)**

Generates personalized journaling prompts based on user context.

```python
class JournalAgent:
    async def generate_prompt(self, user_id: str) -> str:
        """Generate contextual journaling prompt"""
        # Retrieve recent moods and journal entries
        recent_moods = await get_recent_moods(user_id, days=7)
        recent_journals = await get_recent_journals(user_id, count=3)
        
        # Build context
        context = {
            "mood_trend": self._calculate_trend(recent_moods),
            "common_themes": self._extract_themes(recent_journals),
            "user_preferences": await get_user_preferences(user_id)
        }
        
        # Generate prompt using LLM
        prompt_template = """
        Based on the user's recent mental health journey:
        - Mood trend: {mood_trend}
        - Common themes: {common_themes}
        
        Generate a thoughtful journaling prompt that:
        1. Acknowledges their current emotional state
        2. Encourages self-reflection
        3. Promotes positive coping
        """
        
        response = await self.llm.ainvoke(
            prompt_template.format(**context)
        )
        return response.content
```

##### **d) Coping Strategies Agent (`agents/coping_agent.py`)**

Suggests evidence-based coping strategies.

```python
class CopingAgent:
    def __init__(self):
        self.strategies_db = load_coping_strategies()  # Evidence-based strategies
        self.llm = ChatOpenAI(model="gpt-4")
    
    async def suggest_strategies(self, mood: str, context: dict) -> list:
        """Suggest personalized coping strategies"""
        # Filter strategies by mood type
        relevant_strategies = self.strategies_db[mood]
        
        # Personalize using LLM
        personalized = await self.llm.ainvoke(
            f"Personalize these coping strategies for a user feeling {mood}: "
            f"{relevant_strategies}. Consider their context: {context}"
        )
        
        return self._parse_strategies(personalized.content)
```

**LangGraph Development Best Practices:**
- ✅ Always define clear state schemas using `TypedDict`
- ✅ Use conditional edges for complex routing logic
- ✅ Implement proper error handling in each node
- ✅ Store conversation state in MongoDB for persistence
- ✅ Use LangSmith for debugging workflows (optional)

---

#### **3. API Routes (`api/v1/`)**

Each route handles specific functionality:

##### **Authentication (`auth.py`)**
```python
from fastapi import APIRouter, Depends, HTTPException
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter()

@router.post("/register")
async def register(data: RegisterRequest):
    """Register new user with hashed password"""
    return await AuthService.register(data)

@router.post("/login")
async def login(data: LoginRequest):
    """Authenticate user and return JWT token"""
    return await AuthService.login(data)

@router.get("/me")
async def get_current_user(user=Depends(get_current_user)):
    """Get authenticated user profile"""
    return user
```

##### **Mood Tracking (`mood.py`)**
```python
@router.post("/log")
async def log_mood(data: MoodLogRequest, user=Depends(get_current_user)):
    """Log daily mood with optional notes"""
    return await MoodService.log_mood(user.id, data)

@router.get("/trends")
async def get_mood_trends(days: int = 30, user=Depends(get_current_user)):
    """Get mood trends over specified period"""
    return await AnalyticsService.get_mood_trends(user.id, days)
```

##### **AI Chat (`chat.py`)**
```python
@router.post("/message")
async def send_message(data: ChatRequest, user=Depends(get_current_user)):
    """Send message to AI companion"""
    # Use LangGraph conversation graph
    response = await conversation_graph.ainvoke({
        "user_id": user.id,
        "message": data.message,
        "history": await get_chat_history(user.id)
    })
    return response

@router.get("/history")
async def get_chat_history(limit: int = 50, user=Depends(get_current_user)):
    """Retrieve chat history"""
    return await ChatService.get_history(user.id, limit)
```

---

#### **4. Services Layer (`services/`)**

Business logic separated from API routes:

```python
# services/mood_service.py
class MoodService:
    @staticmethod
    async def log_mood(user_id: str, data: MoodLogRequest):
        """Validate and store mood log"""
        mood_log = MoodLog(
            user_id=user_id,
            date=data.date,
            mood_score=data.mood_score,
            notes=data.notes,
            created_at=datetime.utcnow()
        )
        
        # Store in MongoDB
        await db.mood_logs.insert_one(mood_log.dict())
        
        # Trigger analytics update (async)
        await AnalyticsService.update_user_stats(user_id)
        
        return mood_log

# services/analytics_service.py
class AnalyticsService:
    @staticmethod
    async def get_mood_trends(user_id: str, days: int):
        """Calculate mood trends and patterns"""
        moods = await db.mood_logs.find({
            "user_id": user_id,
            "date": {"$gte": datetime.utcnow() - timedelta(days=days)}
        }).to_list(None)
        
        return {
            "average": calculate_average(moods),
            "trend": calculate_trend(moods),
            "patterns": detect_patterns(moods)
        }
```

---

#### **5. Database Layer (`core/database.py`)**

MongoDB connection management:

```python
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    
async def init_db():
    """Initialize MongoDB connection"""
    Database.client = AsyncIOMotorClient(settings.MONGODB_URL)
    
async def get_database():
    """Get database instance"""
    return Database.client[settings.DB_NAME]

# Usage in services
db = await get_database()
users = db.users
mood_logs = db.mood_logs
journals = db.journal_entries
```

---

### Frontend (Next.js)

#### **1. App Router Structure (`app/`)**

Next.js 14 uses file-based routing:

```
app/
├── (auth)/              # Auth route group
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx         # Main dashboard
├── mood/
│   ├── page.tsx         # Mood tracking page
│   └── [id]/
│       └── page.tsx     # Individual mood detail
├── journal/
│   └── page.tsx
├── chat/
│   └── page.tsx         # AI chat interface
├── analytics/
│   └── page.tsx
└── layout.tsx           # Root layout
```

**Key Layout Component:**
```tsx
// app/layout.tsx
import { AuthProvider } from '@/providers/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

#### **2. API Client (`lib/api-client.ts`)**

Centralized API communication:

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (add JWT token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

// Example usage
export const moodApi = {
  logMood: (data: MoodLogData) => 
    apiClient.post('/api/v1/mood/log', data),
  getTrends: (days: number) => 
    apiClient.get(`/api/v1/mood/trends?days=${days}`)
}
```

---

#### **3. State Management (`store/`)**

Using Zustand for lightweight state management:

```typescript
// store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const response = await apiClient.post('/api/v1/auth/login', {
          email, password
        })
        set({
          user: response.data.user,
          token: response.data.access_token,
          isAuthenticated: true
        })
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      }
    }),
    { name: 'auth-storage' }
  )
)

// Usage in components
function Dashboard() {
  const { user, logout } = useAuthStore()
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

#### **4. Custom Hooks (`hooks/`)**

Reusable data fetching logic:

```typescript
// hooks/useMood.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { moodApi } from '@/lib/api-client'

export function useMoodTrends(days: number = 30) {
  return useQuery({
    queryKey: ['mood-trends', days],
    queryFn: () => moodApi.getTrends(days)
  })
}

export function useLogMood() {
  return useMutation({
    mutationFn: (data: MoodLogData) => moodApi.logMood(data),
    onSuccess: () => {
      // Invalidate trends to refetch
      queryClient.invalidateQueries(['mood-trends'])
    }
  })
}

// Usage in component
function MoodTracker() {
  const { data: trends, isLoading } = useMoodTrends(30)
  const logMood = useLogMood()
  
  const handleSubmit = (mood: number) => {
    logMood.mutate({ mood_score: mood, notes: '' })
  }
  
  if (isLoading) return <Spinner />
  
  return <MoodChart data={trends} onSubmit={handleSubmit} />
}
```

---

#### **5. Components (`components/`)**

##### **Chart Component Example:**
```tsx
// components/charts/MoodTrendChart.tsx
import { Line } from 'react-chartjs-2'

interface MoodTrendChartProps {
  data: MoodData[]
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [{
      label: 'Mood Score',
      data: data.map(d => d.mood_score),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Mood Trends</h3>
      <Line data={chartData} options={chartOptions} />
    </div>
  )
}
```

---

### Database (MongoDB)

#### **Schema Design**

```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  password_hash: String,
  profile_data: {
    name: String,
    age: Number,
    preferences: Object
  },
  created_at: Date,
  updated_at: Date
}

// Mood Logs Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  date: Date,
  mood_score: Number (1-10),
  notes: String,
  created_at: Date
}

// Journal Entries Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  date: Date,
  content: String,
  ai_summary: String,
  tags: [String],
  created_at: Date
}

// Chat History Collection
{
  _id: ObjectId,
  user_id: ObjectId,
  role: String (user/assistant),
  content: String,
  timestamp: Date,
  metadata: Object
}
```

#### **Indexes for Performance**

```python
# In database initialization
async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.mood_logs.create_index([("user_id", 1), ("date", -1)])
    await db.journal_entries.create_index([("user_id", 1), ("created_at", -1)])
    await db.chat_history.create_index([("user_id", 1), ("timestamp", -1)])
```

---

## 🚀 Development Setup

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **MongoDB** 6.0+ (local or Atlas)
- **Redis** 7.0+ (optional, for caching)
- **Docker** & Docker Compose (recommended)

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend `.env`:**
```bash
# Database
MONGODB_URL=mongodb://localhost:27017
DB_NAME=wellnest

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# LangSmith (optional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key

# CORS
CORS_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Local Development with Docker

```bash
# Clone repository
git clone https://github.com/yourusername/wellnest.git
cd wellnest

# Start all services
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/api/docs
# - MongoDB: localhost:27017
```

### Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if any)
python -m app.db.init_db

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test
```

---

## 📚 API Documentation

Once the backend is running, access interactive API documentation:

- **Swagger UI:** `http://localhost:8000/api/docs`
- **ReDoc:** `http://localhost:8000/api/redoc`

### Example API Requests

#### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "profile_data": {
      "name": "John Doe"
    }
  }'
```

#### Log Mood
```bash
curl -X POST http://localhost:8000/api/v1/mood/log \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "mood_score": 7,
    "notes": "Feeling good today"
  }'
```

#### Chat with AI
```bash
curl -X POST http://localhost:8000/api/v1/chat/message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling anxious about work"
  }'
```

---

## 🔒 Security & Compliance

### Authentication Flow

1. User registers → Password hashed with bcrypt
2. User logs in → JWT token generated (30-min expiry)
3. Token stored in frontend (httpOnly cookie recommended)
4. Every API request includes token in `Authorization` header
5. Backend validates token on protected routes

### Data Privacy

- ✅ **End-to-end encryption** for sensitive data
- ✅ **GDPR compliance:** User data export and deletion
- ✅ **HIPAA considerations:** Encrypted at rest and in transit
- ✅ **Audit logging:** Track all data access
- ✅ **Role-based access control (RBAC)**

### Security Best Practices

```python
# Password hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token generation
from jose import JWTError, jwt
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

---

## 🚢 Deployment

### Docker Production Build

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment (AWS Example)

1. **Backend:** Deploy FastAPI on AWS ECS or Lambda
2. **Frontend:** Deploy Next.js on Vercel or AWS Amplify
3. **Database:** MongoDB Atlas (managed service)
4. **Cache:** AWS ElastiCache (Redis)
5. **Storage:** AWS S3 for report exports

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy WellNest

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          cd backend && pytest
          cd ../frontend && npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Your deployment script
```

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- **Backend:** Follow PEP 8, use `black` formatter
- **Frontend:** Use ESLint + Prettier
- **Commits:** Follow Conventional Commits

```bash
# Format backend code
black app/ tests/

# Lint frontend code
npm run lint
```

---

## 📞 Support & Resources

- **Documentation:** [docs.wellnest.io](https://docs.wellnest.io)
- **Issues:** [GitHub Issues](https://github.com/yourusername/wellnest/issues)
- **Discord:** [Join Community](https://discord.gg/wellnest)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangGraph** for AI orchestration
- **FastAPI** for excellent API framework
- **Next.js** for powerful React framework
- **MongoDB** for flexible data storage

---

**Built with ❤️ for mental wellness**
