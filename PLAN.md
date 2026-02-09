# GitGud - Code Battle App

> The Duolingo/Matiks for coding. Dead simple. Addictive. Competitive.

---

## Vision

A coding app where you battle real players in quick 1v1 matches. No fluff, no lengthy courses - just prove you can code.

**Target Audience:** Ages 15-30 (students, early-career devs, competitive learners)

**Core Emotion:** The thrill of beating someone in a fair fight.

**Positioning:** "Code fluency sharpening" - for people who code and want to get sharper/faster, not beginners learning from scratch.

---

## MVP Scope (V1)

### What We're Building

One thing, done well: **1v1 Code Battles** - but with the retention hooks that actually keep people coming back.

### Core Loop

```
Open App → Check Streak → Tap "Battle" → Get Matched (instant, bots if needed) → Race to Solve → Learn Why → Win/Lose → Share → Play Again
```

### Features (V1)

| Feature | Description | Priority |
|---------|-------------|----------|
| 1v1 Battles | Real-time match against opponent (human or bot) | Must Have |
| Bot Fallback | Seamless bot matches when no humans available | Must Have |
| Rating System | ELO-style points with floor protection | Must Have |
| Daily Streak | Streak counter with streak freeze | Must Have |
| Explanations | "Why?" shown after each question | Must Have |
| Share Results | Generate shareable card after wins | Must Have |
| Battle Reactions | 4-6 quick emotes during battle | Must Have |
| Practice Mode | Unranked battles to warm up | Must Have |
| Global Leaderboard | See top players, your rank | Must Have |
| Weekly Leagues | 50 players per league, promotion/demotion | Should Have |
| User Profile | Username, rank, win/loss, streak | Must Have |
| Auth | Sign up via Google/Apple/Discord | Must Have |

### NOT in V1

- ❌ Courses / lessons (we're not a learning app)
- ❌ Friends list (Phase 2)
- ❌ Multiple languages (Python only)
- ❌ Achievements / badges (Phase 2)
- ❌ Chat (reactions only)
- ❌ Teams / clans (Phase 3)

---

## Game Mechanics

### Battle Format

- **Match Length:** Best of 3 questions (faster = more addictive)
- **Time per Question:** 20 seconds (creates urgency)
- **Tiebreaker:** If both correct, faster answer wins the point
- **Matching:** Instant. Humans preferred, bot fallback within 5 seconds.

### In-Battle Features

**Reactions (tap to send):**
- 👀 (watching you)
- 🔥 (nice one)
- 💀 (oof)
- 🧠 (big brain)
- ⚡ (fast)
- gg (good game - end of match only)

**Opponent Presence:**
- Show "They answered!" when opponent submits (creates pressure)
- Show typing indicator when they're selecting

**Comeback Bonus:**
- Win from 0-1 down = "Clutch!" badge on result screen
- Extra +5 rating for comeback wins

### Post-Question: The "Why?" Screen

After EVERY question (5 seconds, skippable):
```
┌─────────────────────────────┐
│                             │
│  ✓ Correct!                 │
│                             │
│  x[-1] returns the LAST     │
│  element. Negative indexing │
│  counts from the end.       │
│                             │
│           [GOT IT]          │
│                             │
└─────────────────────────────┘
```

This turns losses into learning. Users improve inside the app, not elsewhere.

### Question Types (V1: One Type)

**Output Prediction (Multiple Choice)**
```
x = [1, 2, 3]
print(x[-1])

What's the output?
A) 1
B) 2
C) 3      ← Correct
D) Error
```

Why this type:
- No typing required (mobile-friendly)
- Clear right/wrong answer
- Fast to answer (5-15 seconds)
- Easy to generate at scale

### Scoring & Rating

| Action | Points |
|--------|--------|
| Win match | +25 (adjusted by opponent rating) |
| Lose match | -15 (adjusted by opponent rating) |
| Comeback win bonus | +5 |
| Starting rating | 0 (not 1000 - only go UP initially) |

**Floor Protection (Anti-Frustration):**
- Once you hit Silver (1000), can't drop below 950
- Once you hit Gold (1500), can't drop below 1450
- Once you hit Diamond (2000), can't drop below 1950

### Difficulty Tiers

| Rating | Tier | Question Difficulty |
|--------|------|---------------------|
| 0-999 | Bronze | Basics (variables, types, simple syntax) |
| 1000-1499 | Silver | Intermediate (loops, functions, common patterns) |
| 1500-1999 | Gold | Advanced (edge cases, tricky syntax, algorithms) |
| 2000+ | Diamond | Expert (obscure behavior, optimization, deep knowledge) |

**Tier-Up Celebration:** When you rank up, full-screen animation + sound + "You reached Silver!" moment.

### Streak System

- **Daily Streak:** Complete 1 battle per day to maintain
- **Streak Display:** Prominent on home screen with flame icon
- **Streak Freeze:** Earn 1 free freeze every 7 days (or buy)
- **Streak Notifications:** Push notification 2 hours before streak expires

### Weekly Leagues

- 50 players per league, matched by rating range
- **Sunday reset:** Top 10 promote, Bottom 10 demote
- Leagues: Bronze → Silver → Gold → Diamond → Champion
- Separate from global rating - creates weekly mini-competition

### Practice Mode

- Unranked battles against bots
- No rating change
- Good for warming up or trying new strategies
- Still counts toward streak

---

## Screens

### 1. Home Screen
```
┌─────────────────────────────┐
│                             │
│      ⚡ GITGUD ⚡         │
│                             │
│    🔥 12 day streak         │
│                             │
│    Rating: 1,247 (Silver)   │
│    Rank: #847               │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │  ⚔️  BATTLE     │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│    [ Practice Mode ]        │
│                             │
│    ─── THIS WEEK ───        │
│    League: Silver II        │
│    Position: 12th of 50     │
│    ↑ Top 10 promote         │
│                             │
└─────────────────────────────┘
```

### 2. Matchmaking Screen
```
┌─────────────────────────────┐
│                             │
│    Finding opponent...      │
│                             │
│         ⚔️                  │
│                             │
│    Usually instant          │
│                             │
└─────────────────────────────┘
```
(Max 5 seconds, then bot match)

### 3. Battle Screen
```
┌─────────────────────────────┐
│  YOU        vs        THEM  │
│  ●○○               ○○○      │
│                             │
│  ─────────────────────────  │
│                             │
│    x = "hello"              │
│    print(x[1:3])            │
│                             │
│  ─────────────────────────  │
│                             │
│    A) "hello"               │
│    B) "el"          ←       │
│    C) "ell"                 │
│    D) "he"                  │
│                             │
│   ⏱️ 18s    [👀][🔥][💀]    │
│                             │
│      "They answered!"       │
│                             │
└─────────────────────────────┘
```

### 4. Explanation Screen (After Each Question)
```
┌─────────────────────────────┐
│                             │
│         ✓ Correct!          │
│         You: 0.8s           │
│         Them: 1.2s          │
│                             │
│  ─────────────────────────  │
│                             │
│  String slicing [1:3] gets  │
│  characters at index 1 and  │
│  2 (end index excluded).    │
│                             │
│  "hello"[1:3] → "el"        │
│                             │
│         [ NEXT ]            │
│                             │
└─────────────────────────────┘
```

### 5. Result Screen (Win)
```
┌─────────────────────────────┐
│                             │
│    ✨ ✨ ✨ VICTORY ✨ ✨ ✨    │
│                             │
│    [Animated confetti]      │
│                             │
│    You: 2  -  Them: 1       │
│    CLUTCH! (comeback win)   │
│                             │
│    +30 rating               │
│    New rating: 1,277        │
│                             │
│    🔥 Streak: 12 days       │
│                             │
│    ┌─────────────────┐      │
│    │   PLAY AGAIN    │      │
│    └─────────────────┘      │
│                             │
│    [ Share ] [ Rematch ]    │
│                             │
└─────────────────────────────┘
```

### 6. Share Card (Generated Image)
```
┌─────────────────────────────┐
│                             │
│      ⚡ GITGUD ⚡         │
│                             │
│    @username WINS           │
│                             │
│    2 - 1 victory            │
│    Rating: 1,277 (Silver)   │
│    🔥 12 day streak         │
│                             │
│    Think you can beat me?   │
│    gitgud.app/challenge  │
│                             │
└─────────────────────────────┘
```

### 7. Profile Screen
```
┌─────────────────────────────┐
│                             │
│          @username          │
│          Silver Player      │
│                             │
│    ─────────────────────    │
│                             │
│    Rating: 1,247            │
│    Global Rank: #847        │
│    🔥 Streak: 12 days       │
│    Best Streak: 23 days     │
│                             │
│    ─────────────────────    │
│                             │
│    Matches: 78              │
│    Wins: 47 (60%)           │
│    Losses: 31               │
│    Avg Answer Time: 4.2s    │
│                             │
│    [ SIGN OUT ]             │
│                             │
└─────────────────────────────┘
```

---

## Technical Architecture

### Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Mobile App | React Native + Expo | Single codebase for iOS & Android |
| Styling | NativeWind (Tailwind) | Fast UI development |
| Auth | Supabase Auth | Google/Apple/Discord OAuth |
| Database | Supabase Postgres | User data, questions, match history |
| Realtime | Supabase Broadcast | Low-latency battle state (NOT DB subscriptions) |
| Game Server | Edge Function or Fly.io | Match orchestration, authoritative game state |
| Hosting | Expo EAS | Easy builds and deployment |

### Critical Architecture Decisions

**Why Supabase Broadcast, not DB subscriptions:**
- DB subscriptions route through Postgres LISTEN/NOTIFY = 200-500ms latency
- Broadcast is direct WebSocket = ~50ms latency
- For timed battles, this matters

**Game Server Responsibilities:**
- Holds authoritative game state in memory
- Uses server timestamps for timing (prevents client cheating)
- Decides round winners
- Handles disconnects with 15-second timeout

### Database Schema

```sql
-- Users (extends Supabase auth.users)
profiles (
  id uuid primary key references auth.users,
  username text unique not null,
  rating integer default 0,
  tier text default 'bronze',
  wins integer default 0,
  losses integer default 0,
  current_streak integer default 0,
  best_streak integer default 0,
  last_battle_date date,
  streak_freezes integer default 0,
  created_at timestamp default now()
)

-- Questions (with explanations!)
questions (
  id uuid primary key default gen_random_uuid(),
  language text not null default 'python',
  difficulty integer not null,  -- 1=bronze, 2=silver, 3=gold, 4=diamond
  category text,                -- 'strings', 'lists', 'functions', etc.
  code_snippet text not null,
  question_text text not null default 'What''s the output?',
  options jsonb not null,       -- ["option1", "option2", "option3", "option4"]
  correct_answer integer not null, -- 0-3 (index)
  explanation text not null,    -- "Why" explanation shown after question
  created_at timestamp default now()
)

-- Match history
matches (
  id uuid primary key default gen_random_uuid(),
  player1_id uuid references profiles,
  player2_id uuid references profiles, -- null if bot match
  is_bot_match boolean default false,
  player1_score integer not null,
  player2_score integer not null,
  winner_id uuid references profiles,
  player1_rating_change integer,
  player2_rating_change integer,
  is_ranked boolean default true,
  started_at timestamp not null,
  ended_at timestamp not null
)

-- Match rounds (for analytics and post-game review)
match_rounds (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches not null,
  round_number integer not null,
  question_id uuid references questions not null,
  player1_answer integer,
  player1_time_ms integer,
  player2_answer integer,
  player2_time_ms integer,
  round_winner_id uuid references profiles
)

-- Question history (prevent repeats)
user_question_history (
  user_id uuid references profiles,
  question_id uuid references questions,
  seen_at timestamp default now(),
  answered_correctly boolean,
  primary key (user_id, question_id)
)

-- Match queue
match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  rating integer not null,
  is_ranked boolean default true,
  joined_at timestamp default now(),
  last_ping timestamp default now(),
  expires_at timestamp default (now() + interval '30 seconds')
)

-- Weekly leagues
league_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  league_tier text not null,        -- 'bronze', 'silver', etc.
  league_group integer not null,    -- which group of 50
  week_start date not null,
  points integer default 0,
  position integer,
  unique (user_id, week_start)
)

-- Indexes
CREATE INDEX idx_profiles_rating ON profiles(rating DESC);
CREATE INDEX idx_questions_difficulty ON questions(difficulty, language);
CREATE INDEX idx_match_queue_rating ON match_queue(rating);
CREATE INDEX idx_match_queue_expires ON match_queue(expires_at);
```

### Matchmaking Algorithm

```
Every 500ms, the matchmaker runs:

1. Clean up expired/stale queue entries (last_ping > 10s ago)

2. For each user in queue (oldest first):
   - time_waiting = now - joined_at
   - acceptable_range = 100 + (time_waiting_seconds * 10)
     // Starts at ±100 rating, expands by 100 per 10 seconds

   - Find best opponent within acceptable_range
   - If found: create match, notify both via Broadcast

   - If waiting > 5 seconds: match with bot instead
     // Never make users wait. Bots are seamless.

3. Bot matches:
   - Bot rating = user rating ± random(50)
   - Bot answer time = difficulty-appropriate random
   - Bot accuracy = 70-90% based on question difficulty
   - User doesn't know it's a bot (no "[BOT]" label)
```

### Disconnect Handling

```
Rules:
- Disconnect for >15 seconds during match = forfeit that round
- Disconnect for >30 seconds = forfeit match
- Reconnect within window = resume seamlessly
- Both disconnect = match voided, no rating change

Implementation:
- Client sends heartbeat every 3 seconds
- Server tracks last_heartbeat per player
- On disconnect detection, start countdown timer
- On reconnect, cancel timer and resume
```

### Realtime Battle Flow

```
1. Player taps "Battle"
2. Client joins match_queue via API
3. Client subscribes to Broadcast channel: `matchmaking:{user_id}`
4. Matchmaker finds opponent (or assigns bot after 5s)
5. Server creates match, broadcasts to both: { event: 'match_found', match_id, opponent }
6. Both clients subscribe to `battle:{match_id}`
7. Server broadcasts: { event: 'round_start', round: 1, question: {...} }
8. Clients show question, start local timer
9. On answer, client sends: { event: 'answer', round: 1, answer: 2, client_time_ms: 4200 }
10. Server records answer with server timestamp
11. When both answered (or timeout), server broadcasts: { event: 'round_result', ... }
12. Server broadcasts explanation for 5 seconds
13. Repeat for 3 rounds
14. Server calculates winner, updates ratings, broadcasts: { event: 'match_result', ... }
```

---

## Content: Questions

### V1 Language Support

**Python only.** It's:
- Most popular for beginners and intermediates
- Clean syntax for mobile reading
- Huge target audience
- Add JavaScript in Phase 2

### Question Format

```json
{
  "id": "uuid",
  "language": "python",
  "difficulty": 2,
  "category": "lists",
  "code_snippet": "x = [1, 2, 3]\nprint(x[-1])",
  "question_text": "What's the output?",
  "options": ["1", "2", "3", "Error"],
  "correct_answer": 2,
  "explanation": "Negative indexing counts from the end. x[-1] returns the last element, which is 3."
}
```

### Question Count

- **Launch:** 200 questions minimum (50 per difficulty tier)
- **Week 2:** 300 questions
- **Month 1:** 500 questions
- **Scaling:** GPT-4 generation + human review pipeline

### Question Categories (Python)

1. Variables & Types (int, str, float, bool, None)
2. Strings & Slicing
3. Lists & Indexing
4. Dictionaries & Sets
5. Loops (for, while, enumerate, zip)
6. Functions (args, kwargs, return, scope)
7. Conditionals (if/else, ternary, truthiness)
8. Built-in Functions (len, range, map, filter)
9. List Comprehensions
10. Error Types & Exceptions

### Example Questions with Explanations

**Bronze (Difficulty 1):**
```python
x = 5
y = 2
print(x + y)
```
- Answer: `7`
- Explanation: "Basic addition. x is 5, y is 2, so x + y = 7."

**Silver (Difficulty 2):**
```python
x = [1, 2, 3, 4, 5]
print(x[1:4])
```
- Answer: `[2, 3, 4]`
- Explanation: "Slicing [1:4] gets elements at index 1, 2, and 3. The end index (4) is excluded."

**Gold (Difficulty 3):**
```python
x = [1, 2, 3]
y = x
y.append(4)
print(x)
```
- Answer: `[1, 2, 3, 4]`
- Explanation: "y = x doesn't copy the list, it creates a reference. Both x and y point to the same list in memory."

**Diamond (Difficulty 4):**
```python
def f(x=[]):
    x.append(1)
    return x
print(f(), f())
```
- Answer: `[1, 1] [1, 1]`
- Explanation: "Default mutable arguments are shared across calls. The same list is reused, so the second call sees [1] and appends another 1."

---

## Monetization

### V1: Ads (Light)

- **Rewarded video ads only** - watch ad to earn streak freeze
- No interstitial ads (users hate them, they'll uninstall)
- One ad placement: "Watch ad for free streak freeze"

### V2: Battle Pass (Primary Revenue)

| Tier | Price | Benefits |
|------|-------|----------|
| Free | $0 | Basic profile, ads for streak freezes |
| Premium | $4.99/mo | No ads, exclusive profile frames, 2 streak freezes/week, early access to new features |
| Battle Pass | $9.99/season | Seasonal cosmetics, exclusive titles, profile customization |

**Battle Pass Seasons:**
- 8-week seasons
- Progress by winning matches
- Unlock cosmetics at milestones: profile frames, titles ("The Python Whisperer"), animated badges

---

## Marketing Strategy

### India-First Approach

Primary market is India (TikTok banned). Focus on platforms that dominate there.

### Platform Priority

1. **Instagram Reels** - Primary. Replaced TikTok in India, massive reach
2. **YouTube Shorts** - Huge in India, great for coding content
3. **YouTube** - Long-form coding content, pre-roll ads
4. **WhatsApp** - Share cards designed for WhatsApp forwarding (viral in India)
5. **Twitter/X** - Tech/developer crowd, meme potential
6. **LinkedIn** - Professional developers, "shareable wins"
7. **Reddit** - r/developersIndia, r/learnpython, r/IndianGaming (organic)

### Content Types

1. **Quiz Clips** (most viral potential)
```
[Show code]
"What does this print?"
[3 second pause]
[Reveal answer]
"Only 12% got this right. Can you beat that?"
```

2. **Battle Recordings**
```
[Split screen of live battle]
[Dramatic music]
[Close finish]
"This is why I'm addicted to GitGud"
```

3. **Rank Climb Compilations**
```
"Day 1: Bronze, 0 rating"
[Montage of wins and losses]
"Day 30: Gold, 1,600 rating"
```

4. **Meme Content** (works well in India)
```
"When you mass assign instead of copy"
[Shows x = y bug]
[Relatable developer pain]
```

### Creator Partnerships

- Partner with Indian coding YouTubers (CodeWithHarry, Apna College, etc.)
- Tech Instagram creators
- Give them early access + creator codes
- "Challenge me" content - creator vs followers

### Ad Concepts

**Concept 1: The Challenge**
```
[Screen recording of battle, fast-paced]
"Think you know Python?"
[Player clutches a comeback win]
"Prove it."
CTA: Download now
```

**Concept 2: The Streak**
```
"Day 1"
[Lose badly]
"Day 15"
[Close matches]
"Day 30"
[Winning streak, diamond rank]
"How far can you go?"
```

**Concept 3: The Quiz Hook**
```
[Show tricky code]
"What does this print?"
[Wait 3 seconds]
[Show answer]
"Be honest - did you get it?"
"Battle people who think they did."
```

**Concept 4: The College Angle** (India-specific)
```
"My placement prep"
[Shows GitGud battles]
"10 minutes a day"
[Shows improvement]
"Better than mass DSA grinding"
```

### WhatsApp Virality

Design share cards specifically for WhatsApp:
- Vertical format (mobile-first)
- Clear "Challenge me" CTA with app link
- Works as static image (no video needed)
- Include QR code for easy download

### India-Specific Considerations

- **Pricing:** Consider INR pricing for premium (₹149/mo vs $4.99)
- **Languages:** English first, Hindi UI later (Phase 3+)
- **Timing:** Push notifications timed for IST peak hours (7-10 PM)
- **College focus:** Partner with coding clubs, college tech fests
- **Placement season:** Marketing push during Sept-Dec (placement prep)

---

## Roadmap

### Phase 1: MVP (Weeks 1-4)
**Core Battle Experience**
- [ ] Auth (Google/Apple sign-in)
- [ ] Home screen with rating, rank, streak
- [ ] Battle matchmaking with bot fallback
- [ ] Battle gameplay (Best of 3)
- [ ] In-battle reactions (4-6 emotes)
- [ ] Post-question explanations
- [ ] Result screen with animations
- [ ] Share card generation
- [ ] Practice mode (unranked)
- [ ] Daily streak system
- [ ] Push notifications (streak expiring)
- [ ] Global leaderboard
- [ ] Weekly leagues (50 players each)
- [ ] 200 Python questions with explanations

### Phase 2: Retention & Social (Weeks 5-8)
**Make It Sticky**
- [ ] Streak freezes (earn via rewarded ads)
- [ ] Daily challenge (same question for everyone, global leaderboard)
- [ ] Friends list
- [ ] Challenge a friend directly
- [ ] "Rematch" button after battles
- [ ] 5 basic achievements (First Win, 10 Wins, 5-Streak, Perfect Game, Clutch)
- [ ] Profile customization (frames, titles)
- [ ] 150 more questions (350 total)

### Phase 3: Growth (Weeks 9-12)
**Expand & Monetize**
- [ ] JavaScript support (second language)
- [ ] Premium subscription
- [ ] Battle Pass (Season 1)
- [ ] Spectator mode (watch live battles)
- [ ] More achievements (15 total)
- [ ] Referral system ("Challenge a friend" links)
- [ ] 150 more questions (500 total)

### Phase 4: Scale (Weeks 13-16)
- [ ] More languages (Java, Go, TypeScript)
- [ ] Tournaments (weekly brackets)
- [ ] Teams/Clans
- [ ] Question submission by community
- [ ] Creator program (revenue share)

---

## Success Metrics

### V1 Goals

| Metric | Target | Why |
|--------|--------|-----|
| D1 Retention | 50%+ | With streaks + explanations, should beat baseline |
| D7 Retention | 25%+ | Weekly leagues create reason to return |
| D30 Retention | 15%+ | Ambitious but achievable with streaks |
| Avg Session Length | 4+ minutes | 3-4 matches per session |
| Matches per User per Day | 3+ | Core engagement metric |
| Streak maintainers | 40%+ of DAU | Proves streak system works |

### North Star Metric

**Weekly Active Battlers (WAB):** Users who complete at least 3 battles per week.

Why 3 battles, not 1: One battle could be accidental. Three shows intent.

---

## Design Principles

### Visual Identity (To Define)

- **Dark mode default** (obviously)
- **Bold gradients** - Purple/blue/cyan coding vibes
- **Glow effects on wins** - Make victory feel victorious
- **Micro-interactions everywhere** - Buttons feel satisfying
- **Custom font** - Not system fonts
- **Animated transitions** - Everything moves smoothly

### Sound Design

- **Victory sound** - Satisfying, iconic (like Duolingo's lesson complete)
- **Defeat sound** - Not depressing, motivating ("try again" energy)
- **Correct answer** - Quick positive ding
- **Wrong answer** - Soft negative (not harsh)
- **Timer warning** - Subtle urgency at 5 seconds
- **Opponent answered** - Creates pressure

### Personality

- **Tone:** Confident but not arrogant. "You got this."
- **No mascot for V1** - Focus on the battles, not a character
- **Celebrate wins hard** - Confetti, animations, sound
- **Soften losses** - Show what to learn, not just "you lost"

---

## Anti-Cheat Considerations

### How People Might Cheat

1. **Googling answers** - Speed-based scoring makes this hard (can't Google in 5 seconds)
2. **Second device with answers** - Question pool large enough that memorization is impractical
3. **Bots/automation** - Rate limiting, device fingerprinting
4. **Multiple accounts** - Link to Google/Apple accounts, one per device

### Mitigations

- **Speed is king** - First to answer correctly wins. Can't Google in 3 seconds.
- **Large question pool** - 200+ questions at launch, 500+ by month 2
- **Question variants** - Same concept, different values (harder to memorize)
- **Report system** - Flag suspicious players for review
- **Soft bans** - If flagged multiple times, match only against other flagged players

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Bots for matchmaking? | ✅ Yes, seamless bots after 5 seconds. Don't tell user it's a bot. |
| Anti-cheat? | Speed-based scoring + large question pool. No perfect solution, but good enough. |
| Question sourcing? | GPT-4 generation with human review. Community submissions in Phase 4. |
| App name? | **GitGud** (code + duel) |

---

## Future Mode: Team Code Wars (Phase 5+)

A second game mode that complements 1v1 quiz battles with team-based strategy gameplay. Inspired by Gladiabots, auto-battlers (TFT), and Clash Royale 2v2.

### Concept Overview

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   2v2 or 3v3 "Code Battles"                             │
│                                                         │
│   Each player builds a "bot" using visual logic blocks  │
│   Team bots work together against enemy team            │
│   Watch the battle play out (or skip to results)        │
│                                                         │
│   Strategy game, not speed game                         │
│   No typing - drag/drop logic blocks                    │
│   Async friendly - build anytime, battle when ready     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why This Mode

| Problem with Quiz-Only | Team Mode Solves It |
|------------------------|---------------------|
| Gets repetitive after 100+ battles | Emergent complexity = infinite variety |
| Solo grind can feel lonely | Social, clan-based gameplay |
| Tests memorization | Tests creative problem-solving |
| High-pressure speed | Relaxed strategy building |
| One dimension of skill | Multiple roles (damage, support, tank) |

### Core Loop

```
1. BUILD (Async, Individual)
   └── Create your bot's AI using visual logic blocks
   └── Test against practice bots
   └── Save multiple bot configurations

2. TEAM UP (Async or Sync)
   └── Join a team (2v2 or 3v3)
   └── See teammate bot types
   └── Synergy bonuses for balanced teams

3. BATTLE (Watch or Skip)
   └── Bots execute their logic automatically
   └── 2-3 minute battles
   └── Watch replay or skip to results

4. OPTIMIZE (Async)
   └── See where your bot failed
   └── Adjust logic based on battle data
   └── Histogram: "Your bot beats 73% of similar bots"
```

### Visual Logic Builder

No typing code on mobile. Drag-and-drop flowchart interface:

```
┌─────────────────────────────────────────┐
│  YOUR BOT: "Sniper"                     │
│  Type: Damage Dealer                    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ IF enemy.health < 30%           │───→ THEN target(enemy)
│  │                                 │    │
│  │ ELIF ally.health < 50%          │───→ THEN buff(ally)
│  │                                 │    │
│  │ ELSE                            │───→ attack(nearest)
│  └─────────────────────────────────┘    │
│                                         │
│  Logic Blocks: 3/10 used                │
│                                         │
│  [ Test ]  [ Save ]  [ Share ]          │
└─────────────────────────────────────────┘
```

### Logic Blocks (Coding Concepts)

Each block teaches a programming concept:

| Block | Programming Concept | Example |
|-------|---------------------|---------|
| `IF / ELIF / ELSE` | Conditionals | IF enemy.health < 50% |
| `FOR EACH` | Loops | FOR EACH enemy in range |
| `WHILE` | While loops | WHILE health > 0 |
| `AND / OR / NOT` | Boolean logic | IF enemy.close AND enemy.weak |
| `PRIORITY` | Execution order | Check healers first |
| `IMPORT` | Functions/modules | Use ally's buff ability |
| `TRY / EXCEPT` | Error handling | Fallback if target dies |
| `VARIABLE` | State management | Remember last target |

Players learn programming concepts through gameplay without realizing it.

### Bot Types & Team Composition

```
DAMAGE DEALERS
├── Sniper: High damage, targets low-health enemies
├── Berserker: AOE damage, reckless
└── Assassin: Targets enemy support first

SUPPORT
├── Healer: Keeps allies alive
├── Buffer: Increases ally damage
└── Debuffer: Weakens enemies

TANKS
├── Guardian: Protects low-health allies
├── Disruptor: Interrupts enemy actions
└── Wall: Absorbs damage, reflects some back
```

**Synergy System:**
- 1 of each type = +10% team stats
- 2 Damage + 1 Support = +15% damage
- 1 Damage + 2 Support = +20% healing
- etc.

### Battle Screen

```
┌─────────────────────────────────────────┐
│  TEAM PYTHONSLAYERS  vs  CODECRUSHERS   │
│      ███████░░░          ░░░░███████    │
│                                         │
│     👤 👤 👤           👤 👤 👤          │
│    (Your bots)      (Enemy bots)        │
│                                         │
│  ─────────────────────────────────────  │
│  Battle Log:                            │
│  > Sniper targets wounded enemy         │
│  > Healer buffs Sniper (+10% damage)    │
│  > Enemy Tank blocks attack             │
│                                         │
│  Round 3/5           [ 2x ] [ Skip ]    │
└─────────────────────────────────────────┘
```

### Clan Wars (Async Team Competition)

```
┌─────────────────────────────────────────┐
│  WEEKLY CLAN WAR                        │
│                                         │
│  🏰 IndieDevs (25 members)              │
│  vs                                     │
│  🏰 TechTitans (25 members)             │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Your contributions this week:          │
│  ✓ 3 team battles completed             │
│  ✓ 5 quiz battles won                   │
│  ✓ Donated 2 logic blocks to clanmates  │
│                                         │
│  Clan Progress: ████████░░ 78%          │
│                                         │
│  Reward if win: "Logic Master" frame    │
│                                         │
└─────────────────────────────────────────┘
```

**Async Contribution:**
- Play battles on your own schedule
- Donate logic blocks to help teammates
- Quiz battle wins also contribute to clan score
- No need to be online at same time

### Why It Won't Get Boring (Infinite Replayability)

| Element | How It Creates Variety |
|---------|------------------------|
| **Emergent complexity** | Simple blocks combine unpredictably |
| **Meta evolution** | Counter-strategies emerge over time |
| **Weekly balance patches** | Block adjustments keep meta fresh |
| **Procedural arenas** | Different conditions each battle |
| **Team compositions** | Countless bot combinations |
| **Optimization depth** | Always room to improve your bot |
| **Social competition** | Clans create ongoing rivalry |

### Anti-Toxicity Design

| Problem | Solution |
|---------|----------|
| "My teammate's bot sucks" | Team score only, no individual blame shown |
| Skill mismatch frustration | Matchmaking on team average rating |
| Coordination overhead | Async building, bots auto-coordinate |
| Carrying burden | All bots contribute equally to outcome |
| Toxic chat | No chat - only positive reaction emotes |

### Integration with Quiz Battles

The two modes complement each other:

| Quiz Battles (Core) | Team Code Wars (Future) |
|---------------------|-------------------------|
| Tests knowledge recall | Tests strategic thinking |
| Fast, high-pressure | Relaxed, thoughtful |
| Solo activity | Team activity |
| 2-3 min sessions | 5-10 min sessions |
| Daily engagement | Weekly clan wars |

**Cross-Progression:**
- Quiz battle wins contribute to clan score
- Unlock logic blocks by reaching quiz milestones
- Same profile, rating, and cosmetics across both modes

### Implementation Phases

**Phase 5 (Months 4-5): Basic Team Mode**
- [ ] Visual logic builder (10 basic blocks)
- [ ] 3 bot types (Damage, Support, Tank)
- [ ] 2v2 matchmaking
- [ ] Basic battle viewer
- [ ] Team rating system

**Phase 6 (Months 5-6): Clans & Wars**
- [ ] Clan creation and management
- [ ] Weekly clan wars
- [ ] Donation system (share logic blocks)
- [ ] Clan leaderboards
- [ ] 10 more logic blocks (20 total)

**Phase 7 (Months 6+): Depth & Polish**
- [ ] 3v3 mode
- [ ] More bot types (9+ total)
- [ ] Spectator mode for clan battles
- [ ] Bot sharing marketplace
- [ ] Tournaments
- [ ] Advanced logic blocks (30+ total)

### Logic Block System

Full block system designed in **[LOGIC_BLOCKS.md](./LOGIC_BLOCKS.md)**

```
66 TOTAL BLOCKS
├── 22 Conditions (what to check)
├── 18 Actions (what to do)
├── 8 Targets (who to affect)
├── 7 Modifiers (how to modify)
├── 6 Flow Control (logic structure)
└── 5 Advanced (complex behaviors)

= 5+ sextillion possible bot configurations
```

Blocks unlock progressively (12 at start → 66 at max level) to avoid overwhelming new players.

### Open Questions for Team Mode

| Question | Options to Explore |
|----------|-------------------|
| Visual style for bots | Robots? Characters? Abstract shapes? Coding mascots? |
| Monetization | Premium blocks? Cosmetic bots? Clan perks? |
| Standalone or integrated? | Same app or separate "GitGud Teams" app? |
| Battle length | 2 min? 3 min? 5 min? |

### Timeline

**Target:** Phase 5+ (after core 1v1 quiz battles are stable and proven)

```
PRIORITY ORDER:
1. ✅ Core quiz battles (Phase 1-2) ← BUILD THIS FIRST
2. ✅ Retention & social (Phase 2-3)
3. ✅ Monetization & growth (Phase 3-4)
4. 🔜 Team Code Wars (Phase 5+) ← THEN THIS
```

Team Mode is a **major expansion**, not MVP. Ship core app first, validate retention, then build this.

---

## Next Steps

### Week 1: Foundation
1. ~~Pick final app name~~ → **GitGud**
2. Set up React Native + Expo project
3. Configure Supabase (auth, database, broadcast)
4. Design system: colors, typography, components
5. Build navigation structure

### Week 2: Core UI
6. Build Home screen
7. Build Battle screen
8. Build Result screen
9. Build Explanation screen
10. Create 50 questions with explanations

### Week 3: Backend
11. Implement matchmaking with bot fallback
12. Implement game server (Edge Function or Fly.io)
13. Implement rating system with floor protection
14. Implement streak system
15. Create 100 more questions (150 total)

### Week 4: Polish & Launch Prep
16. Add share card generation
17. Add in-battle reactions
18. Add animations and sounds
19. Create 50 more questions (200 total)
20. TestFlight beta with friends
21. Iterate based on feedback
