# Coduel - Implementation TODO

> Step-by-step guide to complete the MVP.

---

## Current Status

```
✅ Phase 1: Backend Setup
├── ✅ Supabase project created & configured
├── ✅ All DB tables created (profiles, questions, matches, match_rounds, match_queue, league_memberships, user_question_history)
├── ✅ RLS policies in place
├── ✅ DB triggers (auto profile creation, tier update)
├── ✅ 20 seed questions (Python, difficulty 1-4)
└── ✅ Indexes for performance

✅ Phase 2: Authentication
├── ✅ Google OAuth (fully working)
├── ✅ Guest/anonymous login
├── ✅ Auth context (session, profile, refreshProfile)
├── ✅ AuthGuard (route protection, redirect to auth/onboarding)
├── ✅ Username onboarding (validation, availability check, save)
├── 🔲 Apple OAuth (shows "Coming Soon" alert)
└── 🔲 Edit username after onboarding

✅ Phase 3: Core Battle System
├── ✅ Matchmaking via direct DB (no Edge Functions)
│   ├── ✅ Join queue, find opponent within ±100 rating
│   ├── ✅ Human vs human matching with broadcast
│   ├── ✅ Bot fallback after 5 seconds
│   └── ✅ Question selection (unseen first, fallback logic)
├── ✅ Battle hook (useBattle.ts)
│   ├── ✅ Bot match flow (local answer generation, difficulty-based accuracy)
│   ├── ✅ Human match flow (broadcast + polling, double-processing guard)
│   ├── ✅ computeRoundResult pure function (shared by bot/human)
│   ├── ✅ Best of 3, first to 2 wins
│   └── ✅ Rating update + match record finalization
├── ✅ Battle screen (battle/[id].tsx)
│   ├── ✅ All phases: loading, countdown, question, result, explanation, match_end
│   ├── ✅ Animated timer bar, score dots, reaction icons (Ionicons)
│   ├── ✅ Code snippet display with language label
│   └── ✅ Scrollable question area for long code snippets
├── ✅ Rating system (lib/rating.ts)
│   ├── ✅ ELO-style: +25 win, -15 loss, ±adjustment by rating diff
│   ├── ✅ Comeback bonus (+5)
│   └── ✅ Floor protection (Silver 950, Gold 1450, Diamond 1950)
├── ✅ Bot logic (lib/bot.ts) — name generation, rating simulation
├── ✅ Forfeit system (lib/supabase.ts forfeitMatch)
│   ├── ✅ Mid-match forfeit with confirmation modal
│   ├── ✅ Rating/XP/streak updates for both players
│   ├── ✅ Broadcast notification to opponent
│   └── ✅ "FORFEIT WIN" / "FORFEITED" result display
└── ✅ Match review screen (match/[id].tsx)

✅ Phase 4: Home & Profile
├── ✅ Home screen — real profile data, real matchmaking, streak display
├── ✅ Profile screen — real data from useAuth(), global rank
├── ✅ Profile screen — match history (last 10, opponent names, rating changes)
├── ✅ Profile screen — functional sign out (with confirmation, redirects to /auth)
├── ✅ Leaderboard — global tab with real data (top 50, current user position)
├── ✅ Leaderboard — weekly league tab (league_memberships query, empty state)
└── ✅ Topics tab — practice by topic (Interview, Fundamentals, Advanced, Fun) per language

✅ Phase 5: Streak System (mostly done)
├── ✅ lib/streak.ts — streak logic (increment/reset/freeze)
├── ✅ On battle complete: check last_battle_date, update streak
├── ✅ Update current_streak, best_streak, last_battle_date in profiles
├── ✅ Handle streak freeze (decrement streak_freezes instead of resetting)
├── ✅ Streak freeze count on home screen (snow icon)
├── ✅ Streak display on home screen (flame icon + count)
├── 🔲 Streak break warning modal
├── 🔲 Streak milestone celebrations (7, 30, 100 days)
└── 🔲 "Watch ad for freeze" button (placeholder/future)

🔲 Phase 6: Push Notifications
✅ Phase 7: Share Cards (done)

✅ Phase 8: Polish & Animations (mostly done)
├── ✅ Battle animations (countdown, victory/defeat, confetti, tier promotion)
├── ✅ Skeleton loading states (Home, Profile)
├── ✅ Pull-to-refresh (Home, Profile, Leaderboard, Topics)
├── ✅ Button press feedback (spring scale on Battle button)
├── ✅ Haptic feedback (button presses)
├── ✅ Icon-only tab bar with outline/filled toggle
├── ✅ Battle button shimmer + glow pulse
├── 🔲 Correct/incorrect answer shake animation
├── 🔲 Score update animation (counter)
├── 🔲 Sound effects
├── 🔲 Haptic on correct/incorrect answers
└── 🔲 Custom screen transitions

🔲 Phase 9: Testing & Launch Prep
```

---

---

## Phase 5: Streak System

### 5.1 Streak Logic
- [x] Create `lib/streak.ts`
- [x] On battle complete: check `last_battle_date`, increment or reset streak
- [x] Update `current_streak`, `best_streak`, `last_battle_date` in profiles
- [x] Handle streak freeze (decrement `streak_freezes` instead of resetting)

### 5.2 Streak UI
- [x] Streak freeze count on home screen
- [ ] Streak break warning modal
- [ ] Streak milestone celebrations (7, 30, 100 days)
- [ ] "Watch ad for freeze" button (placeholder/future)

---

## Phase 6: Push Notifications

- [x] Configure Expo notifications plugin in `app.json`
- [ ] Request permissions on first launch
- [ ] Store push token in profiles table
- [ ] Schedule local notification: "Your streak is about to expire!"
- [ ] Weekly league results notification (future)

---

## Phase 7: Share Cards

- [x] Create `components/ShareCard.tsx` (victory card with username, result, rating, streak)
- [x] Use `expo-sharing` + `react-native-view-shot` to capture & share
- [x] Wire share button on match end screen
- [ ] Wire share button on profile screen

---

## Phase 8: Polish & Animations

### 8.1 Battle Animations
- [x] Countdown animation (ZoomIn scale)
- [ ] Correct/incorrect answer feedback (color flash, shake)
- [ ] Score update animation (animated counter)
- [x] Victory/defeat celebration (confetti, animated result screen)
- [x] Tier promotion celebration (TierPromotion component)

### 8.2 General Polish
- [x] Skeleton loading states (Home, Profile)
- [x] Pull-to-refresh on home/profile/leaderboard/topics
- [ ] Custom screen transitions
- [x] Button press feedback (spring scale on Battle button)
- [x] Battle button shimmer sweep + glow pulse animation
- [x] Icon-only tab bar with outline/filled state

### 8.3 Sound Effects
- [ ] Add `assets/sounds/` with battle-start, correct, incorrect, victory, defeat
- [ ] Play sounds at appropriate moments

### 8.4 Haptic Feedback
- [x] Button presses (Battle, Practice)
- [ ] Correct/incorrect answers
- [ ] Victory/defeat

---

## Phase 9: Testing & Launch Prep

### 9.1 Testing
- [ ] Test Google OAuth on real device
- [ ] Test human vs human matchmaking (two devices)
- [ ] Test bot fallback
- [ ] Test all 3 battle rounds + rating changes
- [ ] Test on iOS device
- [ ] Test on Android device

### 9.2 Performance & Stability
- [ ] Add error boundaries
- [ ] Handle network errors gracefully
- [ ] Retry mechanisms for DB calls
- [ ] Disconnect handling (heartbeat, reconnect, forfeit on timeout)
- [ ] Profile with React DevTools, optimize re-renders

### 9.3 App Store Prep
- [ ] App icons (all sizes)
- [ ] Splash screen (polished)
- [ ] App store description & screenshots
- [x] EAS Build setup (configured, project linked)
- [ ] Signing credentials

---

## Not Yet Planned / Future

- Apple OAuth
- Edit username after onboarding
- Settings page (currently empty modal)
- Achievements / badges system
- Daily challenges
- Friends / direct challenges
- Rematch button after battles
- "They answered!" opponent presence indicator
- More questions (need 100+ per difficulty per language)
- More languages (Java, C++, Go, etc.)
- Team Code Wars mode (see PLAN.md Phase 5+)
