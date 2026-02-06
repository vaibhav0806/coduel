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
│   ├── ✅ Animated timer bar, score dots, reaction emojis
│   └── ✅ Code snippet display with language label
├── ✅ Rating system (lib/rating.ts)
│   ├── ✅ ELO-style: +25 win, -15 loss, ±adjustment by rating diff
│   ├── ✅ Comeback bonus (+5)
│   └── ✅ Floor protection (Silver 950, Gold 1450, Diamond 1950)
└── ✅ Bot logic (lib/bot.ts) — name generation, rating simulation

✅ Phase 4: Home & Profile
├── ✅ Home screen — real profile data, real matchmaking, streak display
├── ✅ Profile screen — real data from useAuth(), global rank, member since
├── ✅ Profile screen — match history (last 20, opponent names, rating changes)
├── ✅ Profile screen — functional sign out (with confirmation, redirects to /auth)
├── ✅ Profile screen — fixed LinearGradient TS error
├── ✅ Leaderboard — global tab with real data (top 50, current user position)
└── ✅ Leaderboard — weekly league tab (league_memberships query, empty state)

🔲 Phase 5: Streak System
🔲 Phase 6: Push Notifications
🔲 Phase 7: Share Cards
🔲 Phase 8: Polish & Animations
🔲 Phase 9: Testing & Launch Prep
```

---

---

## Phase 5: Streak System

### 5.1 Streak Logic
- [ ] Create `lib/streak.ts`
- [ ] On battle complete: check `last_battle_date`, increment or reset streak
- [ ] Update `current_streak`, `best_streak`, `last_battle_date` in profiles
- [ ] Handle streak freeze (decrement `streak_freezes` instead of resetting)

### 5.2 Streak UI
- [ ] Streak freeze count on home screen
- [ ] Streak break warning modal
- [ ] Streak milestone celebrations (7, 30, 100 days)
- [ ] "Watch ad for freeze" button (placeholder/future)

---

## Phase 6: Push Notifications

- [ ] Configure Expo notifications in `app.json`
- [ ] Request permissions on first launch
- [ ] Store push token in profiles table
- [ ] Schedule local notification: "Your streak is about to expire!"
- [ ] Weekly league results notification (future)

---

## Phase 7: Share Cards

- [ ] Create `components/ShareCard.tsx` (victory card with username, result, rating, streak)
- [ ] Use `expo-sharing` + `react-native-view-shot` to capture & share
- [ ] Wire share button on match end screen
- [ ] Wire share button on profile screen

---

## Phase 8: Polish & Animations

### 8.1 Battle Animations
- [ ] Countdown animation (scale/fade)
- [ ] Correct/incorrect answer feedback (color flash, shake)
- [ ] Score update animation
- [ ] Victory/defeat celebration

### 8.2 General Polish
- [ ] Skeleton loading states
- [ ] Pull-to-refresh on home/profile/leaderboard
- [ ] Screen transitions
- [ ] Button press feedback (scale)

### 8.3 Sound Effects
- [ ] Add `assets/sounds/` with battle-start, correct, incorrect, victory, defeat
- [ ] Play sounds at appropriate moments

### 8.4 Haptic Feedback
- [ ] Button presses
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
- [ ] Profile with React DevTools, optimize re-renders

### 9.3 App Store Prep
- [ ] App icons (all sizes)
- [ ] Splash screen
- [ ] App store description & screenshots
- [ ] EAS Build setup
- [ ] Signing credentials

---

## Not Yet Planned / Future

- Apple OAuth
- Edit username after onboarding
- Settings page (currently empty modal)
- Achievements system
- Daily challenges
- Friends / direct challenges
- More languages (JavaScript, Java, C++, etc.)
- More questions (need 100+ per difficulty)
