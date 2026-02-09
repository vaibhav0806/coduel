# GitGud

1v1 code battles. Fast, competitive, addictive.

Players battle in real-time best-of-3 matches, predicting code output under time pressure. Think Duolingo meets competitive gaming — for coders.

## Stack

- **App**: React Native + Expo (SDK 54)
- **Styling**: NativeWind (Tailwind CSS)
- **Backend**: Supabase (Auth, Postgres, Realtime Broadcast)
- **Edge Functions**: Deno (Supabase Functions)

## Setup

```bash
# Install dependencies
npm install

# Copy env and fill in your keys
cp .env.example .env

# Start dev server
npm start

# Run on device
npm run android
npm run ios
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID |

## Project Structure

```
├── app/              # Expo Router screens (file-based routing)
│   ├── (tabs)/       # Tab screens (home, leaderboard, profile)
│   └── battle/       # Battle screen
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth)
├── hooks/            # Custom hooks (useBattle)
├── lib/              # Utilities (supabase, rating, streak, league, bot)
├── types/            # TypeScript types
├── supabase/         # Edge Functions (matchmaking, battle)
└── assets/           # Images, fonts
```

## Game Mechanics

- **Format**: Best of 3 rounds, 20 seconds per question
- **Matching**: Humans preferred, bot fallback after 5s
- **Rating**: ELO-style with floor protection per tier
- **Tiers**: Bronze (0) → Silver (1000) → Gold (1500) → Diamond (2000)
- **Streaks**: Daily battle streak with freeze support
- **Leagues**: Weekly leagues with tier-based standings
