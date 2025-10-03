# Authentication & Credit System Features

## Overview
This document outlines the implementation of the authentication system and freemium credit model for the AI Interview Prep application.

## Authentication System

### User Registration & Login
- **Sign Up**: New users create accounts with email/password
- **Login**: Existing users authenticate with email/password
- **JWT Tokens**: Secure session management with JWT tokens
- **Session Persistence**: Users remain logged in across browser sessions

### Credit System (Freemium Model)

#### Anonymous Users (Not Logged In)
- **Free Limit**: 10 questions + answers generation
- **No Saving**: Cannot save sessions or progress
- **Progress Bar**: Visual indicator showing usage (X/10 questions used)
- **Upgrade Prompt**: "Login to get 50 more credits and unlock saving features"

#### Registered Users (Logged In)
- **Initial Credits**: 50 credits upon successful signup
- **Credit Usage**: Each question generation costs 1 credit, each answer generation costs 1 credit
- **Progress Display**: Shows remaining credits in header/sidebar
- **Session Saving**: Full access to save and manage interview sessions

### Session Management

#### For Logged-In Users
- **Auto-Save**: Sessions automatically saved to database
- **Session History**: Left sidebar shows all saved sessions
- **Session Details**: Each session includes:
  - Company name (extracted or user-provided)
  - Job title/position
  - Creation date
  - Number of questions
  - Progress (answered/total)
  - Resume filename (if uploaded)

#### Session Operations
- **Create New**: `+` button to start fresh session
- **Load Session**: Click any saved session to load it
- **Auto-Naming**: Sessions named by company/position or "Interview Session #X"
- **Delete Session**: Option to remove saved sessions

## UI/UX Design

### Left Sidebar (Authentication-Aware)

#### Anonymous Users
```
┌─────────────────────────────┐
│  🔒 Login to unlock more    │
│                             │
│  • Get 50 free credits     │
│  • Save your sessions      │
│  • Access history          │
│                             │
│  [Login] [Sign Up]          │
└─────────────────────────────┘
```

#### Logged-In Users
```
┌─────────────────────────────┐
│  👤 John Doe                │
│  💳 Credits: 42 remaining   │
│                             │
│  📁 Saved Sessions          │
│  ─────────────────────────  │
│  + New Session              │
│                             │
│  📄 Google SWE Interview    │
│     12/15 answered          │
│     2 days ago              │
│                             │
│  📄 Microsoft PM Role       │
│     8/10 answered           │
│     1 week ago              │
│                             │
│  [Logout]                   │
└─────────────────────────────┘
```

### Header Credit Display
- **Anonymous**: "Free: 7/10 questions used" with progress bar
- **Logged-In**: "Credits: 23 remaining" with optional progress indicator

### Mobile Responsive
- Sidebar collapses to bottom tabs on mobile
- Credit display moves to header dropdown on mobile
- Sessions accessible via bottom navigation

## Technical Implementation

### Backend Changes

#### Database Schema Extensions
```python
# User model additions
class UserInDB(BaseModel):
    credits: int = 50  # Default credits for new users
    sessions: List[str] = []  # Session IDs
    usage_stats: Dict[str, Any] = {}  # Track usage patterns

# New Session model
class InterviewSession(BaseModel):
    id: str
    user_id: str
    company_name: Optional[str]
    job_title: Optional[str]
    resume_filename: Optional[str]
    questions: List[Question]
    answers: Dict[str, str]
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
```

#### New API Endpoints
- `GET /auth/profile` - Get user profile with credits
- `POST /auth/profile` - Update user profile
- `GET /sessions` - List user's saved sessions
- `POST /sessions` - Create new session
- `GET /sessions/{session_id}` - Load specific session
- `PUT /sessions/{session_id}` - Update session
- `DELETE /sessions/{session_id}` - Delete session
- `POST /credits/check` - Check if user has enough credits
- `POST /credits/deduct` - Deduct credits for operations

### Frontend Changes

#### New Components
- `AuthModal` - Login/signup modal
- `CreditDisplay` - Credit counter and progress bar
- `SessionSidebar` - Session management sidebar
- `UserProfile` - User account information
- `SessionCard` - Individual session display

#### State Management
- `AuthContext` - Global authentication state
- `SessionContext` - Session management state
- Persistent storage for anonymous user limits

#### Route Protection
- Credit checks before question/answer generation
- Anonymous user limits enforcement
- Session-based state management

## User Flow Examples

### Anonymous User Journey
1. User visits site → sees 10 free questions limit
2. Generates 5 questions → progress shows 5/10 used
3. Tries to generate more → sees upgrade prompt
4. Signs up → gets 50 credits immediately
5. Previous session data optionally transferred

### Logged-In User Journey
1. User logs in → sees sidebar with saved sessions
2. Clicks "+ New Session" → starts fresh
3. Generates questions → credits deducted automatically
4. Session auto-saves with company name detection
5. User can switch between sessions seamlessly

### Session Management Flow
1. User uploads resume for "Google SWE Interview"
2. System detects company name from job description
3. Session auto-named "Google Software Engineer"
4. User can rename session manually
5. Session appears in sidebar for future access

## Advanced Features (Future Enhancements)

### Credit Management
- **Purchase Credits**: Integrate payment system
- **Credit Packages**: Different pricing tiers
- **Usage Analytics**: Detailed usage reports
- **Credit Expiration**: Time-based credit policies

### Session Features
- **Session Sharing**: Share sessions with others
- **Session Templates**: Save common interview templates
- **Session Tags**: Categorize sessions by industry/role
- **Session Analytics**: Track progress and improvement

### User Experience
- **Offline Mode**: Basic functionality without internet
- **Keyboard Shortcuts**: Power user navigation
- **Dark/Light Mode**: Theme persistence per user
- **Export Options**: Multiple export formats per session

## Security Considerations
- JWT token rotation and blacklisting
- Rate limiting on question/answer generation
- Credit manipulation prevention
- Session data encryption
- GDPR compliance for user data

## Monitoring & Analytics
- Track credit usage patterns
- Monitor conversion from anonymous to registered
- Session engagement metrics
- Feature usage analytics
- Performance monitoring for authenticated routes
