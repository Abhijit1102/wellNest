# WellNest Database Design Documentation

## Table of Contents
- [Overview](#overview)
- [Database Architecture](#database-architecture)
- [Collections & Schemas](#collections--schemas)
- [Schema Design Decisions](#schema-design-decisions)
- [Indexing Strategy](#indexing-strategy)
- [Data Relationships](#data-relationships)
- [Scalability Considerations](#scalability-considerations)
- [Security & Privacy](#security--privacy)
- [Caching Strategy](#caching-strategy)
- [Example Queries](#example-queries)
- [Migration & Versioning](#migration--versioning)

---

## Overview

### Purpose
The WellNest database serves as the persistent storage layer for a mental health companion application, managing user data, mood tracking, journaling, AI conversations, and wellness analytics. The database must ensure data privacy, support real-time analytics, and scale efficiently as the user base grows.

### Why MongoDB?
MongoDB was chosen for the following production-critical reasons:

1. **Schema Flexibility**: Mental health data varies significantly between users (custom mood attributes, varied journal structures, different therapy approaches)
2. **Document Model**: Naturally maps to JSON APIs in FastAPI/Next.js, reducing impedance mismatch
3. **Embedded Documents**: Efficiently stores hierarchical data (mood logs with sub-emotions, chat messages with context)
4. **Horizontal Scalability**: Built-in sharding support for handling millions of users
5. **Time-Series Optimization**: Native time-series collections for mood/wellness data (MongoDB 5.0+)
6. **Aggregation Pipeline**: Powerful analytics without ETL processes

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Privacy-First** | Encrypted fields for sensitive data, field-level access control |
| **Query Performance** | Strategic indexing, denormalization where read-heavy |
| **Data Integrity** | Schema validation using MongoDB JSON Schema |
| **Audit Trail** | Created/updated timestamps on all documents |
| **Scalability** | Partitioning strategy by user_id, TTL indexes for data retention |

---

## Database Architecture

### Collections Overview

```
wellnest_db/
├── users                    # Core user profiles and authentication
├── mood_logs               # Daily mood tracking entries
├── journal_entries         # Private journal entries
├── chat_history            # AI conversation threads
├── coping_strategies       # Personalized coping mechanisms
├── reports                 # Generated wellness reports (PDF/CSV metadata)
├── admin_audit_logs        # RBAC and admin action tracking
└── user_preferences        # App settings and customization
```

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
│  (1 user)       │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┬──────────────────┬──────────────────┐
         │                  │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  mood_logs  │    │  journals   │    │chat_history │    │  coping_    │    │  reports    │
│  (many)     │    │  (many)     │    │  (many)     │    │ strategies  │    │  (many)     │
│             │    │             │    │             │    │  (many)     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

Relationship Type: One-to-Many (Referenced, not embedded)
Foreign Key: user_id (indexed on all child collections)
```

---

## Collections & Schemas

### 1. `users`

**Description**: Core user authentication and profile data. Contains PII and must be encrypted at rest.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB primary key |
| `email` | String | Yes | Unique email (lowercase, indexed) |
| `password_hash` | String | Yes | Bcrypt hashed password |
| `full_name` | String | Yes | User's display name |
| `role` | String | Yes | `user` or `admin` (RBAC) |
| `is_active` | Boolean | Yes | Account status (soft delete) |
| `profile` | Object | No | Embedded profile data |
| `profile.age` | Integer | No | Age for demographic analytics |
| `profile.timezone` | String | No | For scheduling reminders |
| `profile.avatar_url` | String | No | Profile picture S3/CDN URL |
| `consent` | Object | Yes | Privacy consents |
| `consent.data_collection` | Boolean | Yes | Agreed to data collection |
| `consent.ai_training` | Boolean | Yes | Opt-in for AI model training |
| `created_at` | ISODate | Yes | Account creation timestamp |
| `updated_at` | ISODate | Yes | Last profile update |
| `last_login` | ISODate | No | Last authentication timestamp |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "email": "jane.doe@example.com",
  "password_hash": "$2b$12$KIXqF9Z3o5z.LQY8Z9z...",
  "full_name": "Jane Doe",
  "role": "user",
  "is_active": true,
  "profile": {
    "age": 28,
    "timezone": "America/New_York",
    "avatar_url": "https://cdn.wellnest.com/avatars/jane-doe.jpg"
  },
  "consent": {
    "data_collection": true,
    "ai_training": false
  },
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-20T14:22:00Z"),
  "last_login": ISODate("2024-04-06T08:15:00Z")
}
```

**Indexes**:

```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1, "is_active": 1 })
db.users.createIndex({ "created_at": -1 })
```

---

### 2. `mood_logs`

**Description**: Time-series collection for daily mood tracking. Optimized for trend analysis and aggregations.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `user_id` | ObjectId | Yes | Reference to users._id |
| `date` | ISODate | Yes | Mood entry date (UTC, start of day) |
| `mood_score` | Integer | Yes | 1-10 scale (1=very low, 10=excellent) |
| `emotions` | Array[String] | No | Tags: ["anxious", "hopeful", "tired"] |
| `energy_level` | Integer | No | 1-5 scale |
| `sleep_hours` | Float | No | Hours slept previous night |
| `activities` | Array[String] | No | ["exercise", "meditation", "therapy"] |
| `notes` | String | No | Optional free-text (max 500 chars) |
| `created_at` | ISODate | Yes | Entry timestamp |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e7"),
  "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "date": ISODate("2024-04-06T00:00:00Z"),
  "mood_score": 7,
  "emotions": ["calm", "optimistic", "focused"],
  "energy_level": 4,
  "sleep_hours": 7.5,
  "activities": ["morning_walk", "meditation"],
  "notes": "Had a productive day at work. Feeling more balanced.",
  "created_at": ISODate("2024-04-06T21:30:00Z")
}
```

**Indexes**:

```javascript
// Compound index for user-specific date range queries
db.mood_logs.createIndex({ "user_id": 1, "date": -1 })

// For aggregation queries (trend analysis)
db.mood_logs.createIndex({ "user_id": 1, "mood_score": 1, "date": -1 })

// TTL index: Auto-delete logs older than 2 years (GDPR compliance)
db.mood_logs.createIndex({ "created_at": 1 }, { expireAfterSeconds: 63072000 })
```

---

### 3. `journal_entries`

**Description**: Private journaling with encryption. High write volume, requires partitioning strategy.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `user_id` | ObjectId | Yes | Reference to users._id |
| `title` | String | No | Entry title (max 200 chars) |
| `content` | String | Yes | Encrypted journal text (Fernet - AES128 + HMAC) |
| `tags` | Array[String] | No | User-defined tags for organization |
| `sentiment_score` | Float | No | AI-analyzed sentiment (-1 to 1) |
| `is_favorite` | Boolean | No | Starred by user |
| `created_at` | ISODate | Yes | Original entry timestamp |
| `updated_at` | ISODate | Yes | Last edit timestamp |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e8"),
  "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "title": "Reflections on today's therapy session",
  "content": "U2FsdGVkX1+ZYqWZ... [ENCRYPTED]",
  "tags": ["therapy", "breakthrough", "anxiety"],
  "sentiment_score": 0.65,
  "is_favorite": true,
  "created_at": ISODate("2024-04-05T19:45:00Z"),
  "updated_at": ISODate("2024-04-05T19:45:00Z")
}
```

**Indexes**:

```javascript
db.journal_entries.createIndex({ "user_id": 1, "created_at": -1 })
db.journal_entries.createIndex({ "user_id": 1, "tags": 1 })
db.journal_entries.createIndex({ "user_id": 1, "is_favorite": 1, "created_at": -1 })
```

---

### 4. `chat_history`

**Description**: AI conversation threads. Uses bucketing pattern to avoid document size limits (16MB).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `user_id` | ObjectId | Yes | Reference to users._id |
| `session_id` | String | Yes | UUID for conversation thread |
| `messages` | Array[Object] | Yes | Bucketed messages (max 100/doc) |
| `messages.role` | String | Yes | `user` or `assistant` |
| `messages.content` | String | Yes | Message text |
| `messages.timestamp` | ISODate | Yes | Message timestamp |
| `messages.tokens` | Integer | No | Token count for cost tracking |
| `bucket_count` | Integer | Yes | Current bucket number (for pagination) |
| `created_at` | ISODate | Yes | Session start time |
| `updated_at` | ISODate | Yes | Last message time |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e9"),
  "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "bucket_count": 1,
  "messages": [
    {
      "role": "user",
      "content": "I've been feeling anxious about work lately",
      "timestamp": ISODate("2024-04-06T14:20:00Z"),
      "tokens": 12
    },
    {
      "role": "assistant",
      "content": "I hear you. It's completely normal to feel anxious about work...",
      "timestamp": ISODate("2024-04-06T14:20:05Z"),
      "tokens": 87
    }
  ],
  "created_at": ISODate("2024-04-06T14:20:00Z"),
  "updated_at": ISODate("2024-04-06T14:35:00Z")
}
```

**Indexes**:

```javascript
db.chat_history.createIndex({ "user_id": 1, "session_id": 1, "bucket_count": -1 })
db.chat_history.createIndex({ "user_id": 1, "updated_at": -1 })
```

**Bucketing Strategy**:
- Each document holds max 100 messages
- When bucket is full, create new document with `bucket_count++`
- Query pattern: Fetch latest bucket first, paginate to older buckets if needed

---

### 5. `coping_strategies`

**Description**: Personalized coping mechanisms recommended by AI or added by users.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `user_id` | ObjectId | Yes | Reference to users._id |
| `title` | String | Yes | Strategy name (e.g., "Box Breathing") |
| `description` | String | Yes | Detailed instructions |
| `category` | String | Yes | `breathing`, `grounding`, `cognitive`, `physical` |
| `effectiveness_rating` | Integer | No | User-rated 1-5 stars |
| `times_used` | Integer | Yes | Usage counter |
| `source` | String | Yes | `ai_recommended`, `user_created`, `therapist` |
| `created_at` | ISODate | Yes | Strategy creation |
| `last_used` | ISODate | No | Last usage timestamp |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5ea"),
  "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "title": "5-4-3-2-1 Grounding Technique",
  "description": "Acknowledge 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
  "category": "grounding",
  "effectiveness_rating": 5,
  "times_used": 23,
  "source": "ai_recommended",
  "created_at": ISODate("2024-02-10T11:00:00Z"),
  "last_used": ISODate("2024-04-05T16:30:00Z")
}
```

**Indexes**:

```javascript
db.coping_strategies.createIndex({ "user_id": 1, "category": 1 })
db.coping_strategies.createIndex({ "user_id": 1, "effectiveness_rating": -1 })
```

---

### 6. `reports`

**Description**: Metadata for generated wellness reports (PDF/CSV files stored in S3).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `user_id` | ObjectId | Yes | Reference to users._id |
| `report_type` | String | Yes | `weekly`, `monthly`, `custom` |
| `date_range` | Object | Yes | Report period |
| `date_range.start` | ISODate | Yes | Start date |
| `date_range.end` | ISODate | Yes | End date |
| `format` | String | Yes | `pdf` or `csv` |
| `file_url` | String | Yes | S3 signed URL (expires in 7 days) |
| `file_size_bytes` | Integer | Yes | File size for quotas |
| `status` | String | Yes | `generating`, `completed`, `failed` |
| `created_at` | ISODate | Yes | Report generation time |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5eb"),
  "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "report_type": "monthly",
  "date_range": {
    "start": ISODate("2024-03-01T00:00:00Z"),
    "end": ISODate("2024-03-31T23:59:59Z")
  },
  "format": "pdf",
  "file_url": "https://s3.amazonaws.com/wellnest-reports/...",
  "file_size_bytes": 245678,
  "status": "completed",
  "created_at": ISODate("2024-04-01T09:15:00Z")
}
```

**Indexes**:

```javascript
db.reports.createIndex({ "user_id": 1, "created_at": -1 })
db.reports.createIndex({ "user_id": 1, "status": 1 })
// TTL: Auto-delete report metadata after 90 days
db.reports.createIndex({ "created_at": 1 }, { expireAfterSeconds: 7776000 })
```

---

### 7. `admin_audit_logs`

**Description**: RBAC audit trail for compliance (HIPAA/GDPR).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | Primary key |
| `admin_id` | ObjectId | Yes | Admin user who performed action |
| `action` | String | Yes | `user_deactivate`, `data_export`, `report_view` |
| `target_user_id` | ObjectId | No | Affected user (if applicable) |
| `ip_address` | String | Yes | Admin's IP |
| `metadata` | Object | No | Additional context |
| `timestamp` | ISODate | Yes | Action timestamp |

**Example Document**:

```json
{
  "_id": ObjectId("6475a3b2c8f9e1a2b3c4d5ec"),
  "admin_id": ObjectId("6475a3b2c8f9e1a2b3c4d5ff"),
  "action": "data_export",
  "target_user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
  "ip_address": "192.168.1.10",
  "metadata": {
    "export_format": "csv",
    "reason": "GDPR data request"
  },
  "timestamp": ISODate("2024-04-06T10:00:00Z")
}
```

**Indexes**:

```javascript
db.admin_audit_logs.createIndex({ "timestamp": -1 })
db.admin_audit_logs.createIndex({ "admin_id": 1, "timestamp": -1 })
db.admin_audit_logs.createIndex({ "target_user_id": 1 })
```

---

## Schema Design Decisions

### Embedded vs. Referenced Documents

| Pattern | Use Case | Rationale |
|---------|----------|-----------|
| **Referenced** (user_id) | mood_logs, journal_entries, chat_history | Unbounded one-to-many. A user may have thousands of logs. Embedding would exceed 16MB document limit. |
| **Embedded** | user.profile, consent objects | 1:1 relationship, small and static. Always queried together with parent. |
| **Bucketing** | chat_history.messages | Controlled embedding to avoid document size explosion. 100 messages per bucket = ~2MB average. |

### Tradeoffs

**Why not embed mood_logs in users?**
```json
// ❌ Bad: Embedded (violates document size limits)
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "mood_logs": [ /* 10,000+ entries = exceeded 16MB */ ]
}

// ✅ Good: Referenced
mood_logs: { "user_id": ObjectId("..."), "date": ISODate("..."), ... }
```

**Why embed user.profile?**
- Profile data is small (<1KB) and rarely changes
- Always retrieved with user authentication
- Avoids extra query join penalty

### Handling Large Data Growth

| Collection | Growth Pattern | Mitigation Strategy |
|------------|----------------|---------------------|
| `journal_entries` | ~30 entries/user/month | Sharding by user_id, TTL indexes for old data |
| `chat_history` | ~500 messages/session | Bucketing pattern (100 messages/doc), archive old sessions to cold storage |
| `mood_logs` | ~1 entry/user/day | Time-series collection (MongoDB 5.0+), pre-aggregated views for analytics |

---

## Indexing Strategy

### Compound Indexes Explained

**1. User-Date Range Queries (Most Common)**

```javascript
db.mood_logs.createIndex({ "user_id": 1, "date": -1 })
```

**Rationale**: 
- 90% of queries filter by user first (`user_id = X`)
- Then sort/filter by date range (`date BETWEEN Y AND Z`)
- Compound index covers both operations efficiently
- `-1` (descending) for "most recent first" queries

**Query Coverage**:
```javascript
// ✅ Uses index efficiently
db.mood_logs.find({ user_id: ObjectId("...") }).sort({ date: -1 }).limit(30)

// ✅ Also covered
db.mood_logs.find({ 
  user_id: ObjectId("..."),
  date: { $gte: ISODate("2024-03-01"), $lte: ISODate("2024-03-31") }
})
```

**2. Analytics Queries (Trend Analysis)**

```javascript
db.mood_logs.createIndex({ "user_id": 1, "mood_score": 1, "date": -1 })
```

**Rationale**:
- Supports aggregations like "average mood score over time"
- Index contains all fields needed (covered query = no document lookups)

**Example Query**:
```javascript
db.mood_logs.aggregate([
  { $match: { user_id: ObjectId("...") } },
  { $group: { 
    _id: { $week: "$date" },
    avg_mood: { $avg: "$mood_score" }
  }}
])
```

### Query Optimization Examples

**Before Optimization** (5.2s for 100k documents):
```javascript
// ❌ Table scan - no index on tags
db.journal_entries.find({ 
  user_id: ObjectId("..."),
  tags: { $in: ["anxiety", "therapy"] }
})
```

**After Optimization** (120ms):
```javascript
// ✅ Added multikey index
db.journal_entries.createIndex({ "user_id": 1, "tags": 1 })
```

### Index Monitoring

```javascript
// Check index usage
db.mood_logs.aggregate([
  { $indexStats: {} }
])

// Identify slow queries (enable profiling)
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

---

## Data Relationships

### One-to-Many Patterns

**Primary Relationship**: `users` → `[mood_logs, journal_entries, chat_history, coping_strategies, reports]`

```
users (1)
  └─ user_id (FK in all child collections)
       ├─ mood_logs (many)
       ├─ journal_entries (many)
       ├─ chat_history (many)
       ├─ coping_strategies (many)
       └─ reports (many)
```

### Referential Consistency Strategy

**MongoDB does NOT enforce foreign key constraints**. We implement application-level integrity:

1. **On User Deletion** (GDPR Right to be Forgotten):
```python
# FastAPI endpoint
async def delete_user(user_id: ObjectId):
    # Delete in order (child → parent)
    await mood_logs.delete_many({"user_id": user_id})
    await journal_entries.delete_many({"user_id": user_id})
    await chat_history.delete_many({"user_id": user_id})
    await coping_strategies.delete_many({"user_id": user_id})
    await reports.delete_many({"user_id": user_id})
    await users.delete_one({"_id": user_id})
    
    # Audit log
    await admin_audit_logs.insert_one({
        "action": "user_deleted",
        "target_user_id": user_id,
        "timestamp": datetime.utcnow()
    })
```

2. **Orphaned Document Prevention**:
```python
# Pre-insert validation
async def create_mood_log(user_id: ObjectId, data: MoodLogSchema):
    user = await users.find_one({"_id": user_id, "is_active": True})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await mood_logs.insert_one({**data, "user_id": user_id})
```

3. **Change Streams for Reactive Cleanup** (MongoDB 4.0+):
```python
# Watch for user deactivations
async def watch_user_changes():
    async with users.watch([
        {"$match": {"operationType": "update", "updateDescription.updatedFields.is_active": False}}
    ]) as stream:
        async for change in stream:
            user_id = change["documentKey"]["_id"]
            # Trigger background job to archive/anonymize data
            await anonymize_user_data(user_id)
```

---

## Scalability Considerations

### Horizontal Scaling (MongoDB Atlas)

**Current Setup**: Single replica set (3 nodes)
- Primary: Read/Write
- Secondaries: Read replicas + failover

**Scaling Thresholds**:

| Metric | Threshold | Action |
|--------|-----------|--------|
| Users | 100K+ | Enable sharding on `users` collection |
| Mood logs | 10M+ documents | Shard by `user_id` (hashed) |
| Queries/sec | 10K+ | Read preference to secondaries |
| Storage | 500GB+ | Archive old data to S3 + Atlas Data Lake |

### Sharding Strategy

**Shard Key Selection**: `user_id` (Hashed)

**Rationale**:
- **Even distribution**: Hash prevents hotspots (vs. range-based on date)
- **Query isolation**: User queries hit single shard (no scatter-gather)
- **Write scalability**: New users auto-balanced across shards

**Implementation**:
```javascript
sh.enableSharding("wellnest_db")

// Shard user-specific collections
sh.shardCollection("wellnest_db.mood_logs", { "user_id": "hashed" })
sh.shardCollection("wellnest_db.journal_entries", { "user_id": "hashed" })
sh.shardCollection("wellnest_db.chat_history", { "user_id": "hashed" })
```

**Anti-Pattern to Avoid**:
```javascript
// ❌ Bad: Shard by date (creates hotspots)
sh.shardCollection("wellnest_db.mood_logs", { "date": 1 })
// All writes go to most recent shard = unbalanced
```

### Handling 100K+ Users

**Performance Projections**:

| Users | Daily Writes | Daily Reads | Storage/Year | Strategy |
|-------|--------------|-------------|--------------|----------|
| 10K | ~10K | ~100K | 50GB | Single cluster |
| 100K | ~100K | ~1M | 500GB | Sharding + read replicas |
| 1M | ~1M | ~10M | 5TB | Multi-region + CDN caching |

**Data Archival Policy**:
- **Mood logs**: Keep 2 years, then move to Atlas Data Lake
- **Chat history**: Keep 1 year active, archive to S3 (compressed)
- **Reports**: Delete after 90 days (user can regenerate)

---

## Security & Privacy

### Encryption at Rest

**MongoDB Atlas**: Automatic encryption using AES-256
- Enabled at cluster level
- Keys managed by AWS KMS / Azure Key Vault

**Application-Level Encryption** (Sensitive Fields):

```python
from cryptography.fernet import Fernet

# Encrypt journal content before DB insert
def encrypt_journal(content: str, user_key: bytes) -> str:
    f = Fernet(user_key)
    return f.encrypt(content.encode()).decode()

# Decrypt on retrieval
def decrypt_journal(encrypted: str, user_key: bytes) -> str:
    f = Fernet(user_key)
    return f.decrypt(encrypted.encode()).decode()
```

**Encrypted Fields**:
- `journal_entries.content`
- `chat_history.messages.content` (optional, based on user preference)

### GDPR/HIPAA Considerations

**GDPR Compliance**:

| Requirement | Implementation |
|-------------|----------------|
| Right to Access | Export all user data via `/api/users/{id}/export` |
| Right to Deletion | Cascade delete with audit trail |
| Right to Portability | Generate JSON export with all collections |
| Consent Management | `users.consent` object tracks permissions |
| Data Minimization | TTL indexes auto-delete old logs |

**HIPAA Considerations** (if handling PHI):
- **BAA Required**: Sign Business Associate Agreement with MongoDB Atlas
- **Access Logs**: All DB access logged via `admin_audit_logs`
- **Audit Trail**: Immutable audit logs (no updates/deletes allowed)
- **Session Timeout**: JWT expires after 1 hour
- **IP Whitelisting**: Restrict DB access to backend servers only

### Data Deletion Strategy

**Soft Delete** (Reversible within 30 days):
```javascript
// User deactivation
db.users.updateOne(
  { _id: ObjectId("...") },
  { 
    $set: { 
      is_active: false,
      deactivated_at: new Date()
    }
  }
)

// TTL index for permanent deletion
db.users.createIndex(
  { "deactivated_at": 1 },
  { 
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { is_active: false }
  }
)
```

**Hard Delete** (Immediate GDPR request):
```python
async def gdpr_delete_user(user_id: ObjectId):
    # 1. Export data first (compliance)
    await export_user_data(user_id)
    
    # 2. Delete all user data
    collections = [
        mood_logs, journal_entries, chat_history,
        coping_strategies, reports
    ]
    for collection in collections:
        await collection.delete_many({"user_id": user_id})
    
    # 3. Anonymize audit logs (keep for compliance, remove PII)
    await admin_audit_logs.update_many(
        {"target_user_id": user_id},
        {"$set": {"target_user_id": "REDACTED"}}
    )
    
    # 4. Delete user account
    await users.delete_one({"_id": user_id})
```

---

## Caching Strategy

### Redis Architecture

**Purpose**: Reduce MongoDB load for frequently accessed, read-heavy data.

**What to Cache**:

| Data Type | Cache Key Pattern | TTL | Invalidation Trigger |
|-----------|-------------------|-----|---------------------|
| User profiles | `user:{user_id}:profile` | 1 hour | Profile update |
| Mood trends | `user:{user_id}:mood:30d` | 15 min | New mood log |
| Recent journals | `user:{user_id}:journals:recent` | 5 min | New journal entry |
| Coping strategies | `user:{user_id}:strategies` | 30 min | Strategy update |
| Aggregated analytics | `user:{user_id}:analytics:weekly` | 1 hour | End of day |

### Cache Key Design

**Hierarchical Naming Convention**:
```
{entity}:{id}:{resource}:{filter}
```

**Examples**:
```python
# User profile
f"user:{user_id}:profile"

# Last 30 days mood scores
f"user:{user_id}:mood:30d"

# Weekly report cache
f"user:{user_id}:report:week:{week_number}"
```

### TTL Strategy

**Dynamic TTL Based on Data Volatility**:

```python
async def get_mood_trend(user_id: str):
    cache_key = f"user:{user_id}:mood:30d"
    
    # Check cache first
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Compute from DB
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$sort": {"date": -1}},
        {"$limit": 30},
        {"$group": {
            "_id": None,
            "avg_score": {"$avg": "$mood_score"}
        }}
    ]
    result = await mood_logs.aggregate(pipeline).to_list(1)
    
    # Cache with 15min TTL (updated multiple times/day)
    await redis.setex(cache_key, 900, json.dumps(result))
    return result
```

### Cache Invalidation

**Write-Through Strategy**:
```python
async def create_mood_log(user_id: str, data: dict):
    # 1. Write to MongoDB
    result = await mood_logs.insert_one({
        **data,
        "user_id": ObjectId(user_id),
        "created_at": datetime.utcnow()
    })
    
    # 2. Invalidate related caches
    cache_keys = [
        f"user:{user_id}:mood:30d",
        f"user:{user_id}:analytics:weekly"
    ]
    await redis.delete(*cache_keys)
    
    return result
```

**Cache-Aside Pattern** (Lazy Loading):
```python
async def get_user_profile(user_id: str):
    cache_key = f"user:{user_id}:profile"
    
    # Try cache
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Cache miss - query DB
    user = await users.find_one({"_id": ObjectId(user_id)})
    if user:
        await redis.setex(cache_key, 3600, json.dumps(user, default=str))
    
    return user
```

---

## Example Queries

### 1. Get 30-Day Mood Trend

```python
# Aggregation pipeline
pipeline = [
    {
        "$match": {
            "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
            "date": {
                "$gte": datetime(2024, 3, 7),
                "$lte": datetime(2024, 4, 6)
            }
        }
    },
    {
        "$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$date"}},
            "avg_mood": {"$avg": "$mood_score"},
            "energy_avg": {"$avg": "$energy_level"}
        }
    },
    {
        "$sort": {"_id": 1}
    }
]

result = await db.mood_logs.aggregate(pipeline).to_list(30)
```

**Output**:
```json
[
  {"_id": "2024-03-07", "avg_mood": 6.5, "energy_avg": 3.0},
  {"_id": "2024-03-08", "avg_mood": 7.2, "energy_avg": 4.0}
]
```

---

### 2. Fetch Recent Journal Entries (Paginated)

```python
# Optimized query with projection
journals = await db.journal_entries.find(
    {"user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6")},
    {"title": 1, "tags": 1, "created_at": 1, "is_favorite": 1}  # Exclude encrypted content
).sort("created_at", -1).skip(0).limit(20).to_list(20)
```

---

### 3. Get Conversation History (Latest Session)

```python
# Fetch most recent session's latest bucket
chat = await db.chat_history.find(
    {"user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6")}
).sort([("updated_at", -1), ("bucket_count", -1)]).limit(1).to_list(1)

if chat:
    messages = chat[0]["messages"]
```

---

### 4. Generate Weekly Analytics

```python
# Complex aggregation with facets
pipeline = [
    {
        "$match": {
            "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
            "date": {
                "$gte": datetime(2024, 3, 31),
                "$lte": datetime(2024, 4, 6)
            }
        }
    },
    {
        "$facet": {
            "mood_summary": [
                {"$group": {
                    "_id": None,
                    "avg_mood": {"$avg": "$mood_score"},
                    "max_mood": {"$max": "$mood_score"},
                    "min_mood": {"$min": "$mood_score"}
                }}
            ],
            "emotion_frequency": [
                {"$unwind": "$emotions"},
                {"$group": {"_id": "$emotions", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": 5}
            ],
            "sleep_average": [
                {"$group": {"_id": None, "avg_sleep": {"$avg": "$sleep_hours"}}}
            ]
        }
    }
]

analytics = await db.mood_logs.aggregate(pipeline).to_list(1)
```

**Output**:
```json
{
  "mood_summary": [{"avg_mood": 7.1, "max_mood": 9, "min_mood": 5}],
  "emotion_frequency": [
    {"_id": "calm", "count": 15},
    {"_id": "anxious", "count": 8}
  ],
  "sleep_average": [{"avg_sleep": 7.2}]
}
```

---

### 5. Find Top Effective Coping Strategies

```python
strategies = await db.coping_strategies.find(
    {
        "user_id": ObjectId("6475a3b2c8f9e1a2b3c4d5e6"),
        "effectiveness_rating": {"$gte": 4}
    }
).sort("times_used", -1).limit(5).to_list(5)
```

---

### 6. Admin Query: Users with Low Mood (Intervention Alert)

```python
# Identify users with consistently low mood scores
pipeline = [
    {
        "$match": {
            "date": {"$gte": datetime.utcnow() - timedelta(days=7)},
            "mood_score": {"$lte": 4}
        }
    },
    {
        "$group": {
            "_id": "$user_id",
            "low_mood_days": {"$sum": 1},
            "avg_mood": {"$avg": "$mood_score"}
        }
    },
    {
        "$match": {"low_mood_days": {"$gte": 5}}  # 5+ low days in a week
    },
    {
        "$lookup": {
            "from": "users",
            "localField": "_id",
            "foreignField": "_id",
            "as": "user"
        }
    },
    {
        "$project": {
            "email": {"$arrayElemAt": ["$user.email", 0]},
            "low_mood_days": 1,
            "avg_mood": 1
        }
    }
]

at_risk_users = await db.mood_logs.aggregate(pipeline).to_list(100)
```

---

## Migration & Versioning

### Schema Evolution Strategy

**Versioning Approach**: Field-level versioning (no schema_version field needed)

**Principles**:
1. **Additive Changes**: Always backward-compatible (add optional fields)
2. **Deprecation Period**: 6 months before removing old fields
3. **Migration Scripts**: Python scripts for bulk updates

### Example: Adding New Field

**Scenario**: Add `anxiety_level` to `mood_logs`

**Step 1: Update Application Code**
```python
# FastAPI model (Pydantic)
class MoodLogSchema(BaseModel):
    mood_score: int
    anxiety_level: Optional[int] = None  # New optional field
    # ... other fields
```

**Step 2: Deploy (No Migration Needed)**
- New documents include `anxiety_level`
- Old documents work without it (optional field)

**Step 3: Backfill (if needed)**
```python
# Background job
async def backfill_anxiety_levels():
    cursor = db.mood_logs.find({"anxiety_level": {"$exists": False}})
    async for doc in cursor:
        # Derive from mood_score (example logic)
        anxiety = max(1, 10 - doc["mood_score"])
        await db.mood_logs.update_one(
            {"_id": doc["_id"]},
            {"$set": {"anxiety_level": anxiety}}
        )
```

---

### Breaking Changes (Rare)

**Scenario**: Change `mood_score` from integer (1-10) to float (1.0-10.0)

**Migration Script**:
```python
async def migrate_mood_score_to_float():
    # 1. Add new field
    await db.mood_logs.update_many(
        {},
        [{"$set": {"mood_score_v2": {"$toDouble": "$mood_score"}}}]
    )
    
    # 2. Deploy app with dual-read logic
    # (reads mood_score_v2, falls back to mood_score)
    
    # 3. After 2 weeks (verify no errors):
    await db.mood_logs.update_many(
        {},
        [
            {"$unset": "mood_score"},
            {"$rename": {"mood_score_v2": "mood_score"}}
        ]
    )
```

---

### Backward Compatibility Pattern

**Application Code** (handles multiple schema versions):

```python
async def get_mood_score(doc: dict) -> float:
    # Handle both old (int) and new (float) formats
    if isinstance(doc.get("mood_score"), int):
        return float(doc["mood_score"])
    return doc.get("mood_score", 5.0)  # Default if missing
```

---

### Change Log

| Version | Date | Changes | Migration Required |
|---------|------|---------|-------------------|
| 1.0.0 | 2024-01-15 | Initial schema | N/A |
| 1.1.0 | 2024-03-10 | Added `anxiety_level` to mood_logs | No (optional field) |
| 1.2.0 | 2024-04-01 | Added `session_id` to chat_history | Yes (backfill UUIDs) |

---

## Maintenance Checklist

### Weekly
- [ ] Monitor slow queries (`db.setProfilingLevel`)
- [ ] Check index usage (`db.collection.aggregate([{$indexStats:{}}])`)
- [ ] Review disk usage and growth trends

### Monthly
- [ ] Analyze query patterns and adjust indexes
- [ ] Review TTL index effectiveness
- [ ] Audit user deletion compliance (GDPR)

### Quarterly
- [ ] Review sharding strategy (if enabled)
- [ ] Evaluate archival policy (move old data to Data Lake)
- [ ] Security audit (access logs, encryption keys rotation)

---

**Document Version**: 1.0  
**Last Updated**: 2024-04-06  
**Maintained By**: Backend Engineering Team