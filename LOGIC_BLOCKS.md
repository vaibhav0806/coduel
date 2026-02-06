# Team Code Wars - Logic Block System

> 50+ blocks organized into categories. Unlocked progressively to avoid overwhelming new players.

---

## Overview

```
BLOCK TYPES:
├── CONDITIONS (22 blocks) - What to check
├── ACTIONS (18 blocks) - What to do
├── TARGETS (8 blocks) - Who to affect
├── MODIFIERS (7 blocks) - How to modify actions
├── FLOW CONTROL (6 blocks) - Logic structure
└── ADVANCED (5 blocks) - Complex behaviors

TOTAL: 66 blocks
```

---

## How Blocks Connect

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  CONDITION  │───→│   ACTION    │───→│   TARGET    │
│  (IF this)  │    │  (DO this)  │    │  (TO this)  │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                   ┌──────┴──────┐
                   │  MODIFIER   │
                   │ (WITH this) │
                   └─────────────┘

Example:
IF enemy.health < 30% → ATTACK (critical) → WEAKEST_ENEMY
```

---

## 1. CONDITION BLOCKS (22 total)

### Enemy Conditions (8 blocks)

| Block | Syntax | What It Checks | Unlock |
|-------|--------|----------------|--------|
| `ENEMY_HEALTH` | `IF enemy.health <>/= X%` | Enemy HP threshold | Starter |
| `ENEMY_TYPE` | `IF enemy.type = damage/support/tank` | Enemy role | Starter |
| `ENEMY_DISTANCE` | `IF enemy.distance = near/mid/far` | Positioning | Level 3 |
| `ENEMY_TARGETING_ME` | `IF enemy.is_targeting(self)` | Am I being focused? | Level 5 |
| `ENEMY_TARGETING_ALLY` | `IF enemy.is_targeting(ally)` | Is ally in danger? | Level 5 |
| `ENEMY_ACTION` | `IF enemy.last_action = attack/defend/heal` | What did they just do? | Level 8 |
| `ENEMY_COOLDOWN` | `IF enemy.ability_on_cooldown` | Is their strong move available? | Level 12 |
| `ENEMY_BUFF_STATUS` | `IF enemy.has_buff(type)` | Are they buffed? | Level 10 |

### Ally Conditions (6 blocks)

| Block | Syntax | What It Checks | Unlock |
|-------|--------|----------------|--------|
| `ALLY_HEALTH` | `IF ally.health <>/= X%` | Ally HP threshold | Starter |
| `ALLY_TYPE` | `IF ally.type = damage/support/tank` | Ally role | Level 2 |
| `ALLY_IN_DANGER` | `IF ally.health < 30% AND ally.being_targeted` | Ally needs help NOW | Level 6 |
| `ALLY_BUFF_STATUS` | `IF ally.has_buff(type)` | Is ally buffed? | Level 10 |
| `ALLY_ALIVE_COUNT` | `IF allies_alive <>/= X` | How many allies left? | Level 7 |
| `ALLY_NEEDS_HEAL` | `IF ally.health < ally.max_health - 20%` | Ally missing HP | Level 4 |

### Self Conditions (5 blocks)

| Block | Syntax | What It Checks | Unlock |
|-------|--------|----------------|--------|
| `SELF_HEALTH` | `IF self.health <>/= X%` | My HP threshold | Starter |
| `SELF_ENERGY` | `IF self.energy <>/= X` | Do I have resources? | Level 4 |
| `SELF_COOLDOWN` | `IF self.ability_ready(name)` | Is my ability off cooldown? | Level 6 |
| `SELF_BUFF_STATUS` | `IF self.has_buff(type)` | Am I buffed? | Level 10 |
| `SELF_LAST_ACTION` | `IF self.last_action = X` | What did I just do? | Level 8 |

### Battle Conditions (3 blocks)

| Block | Syntax | What It Checks | Unlock |
|-------|--------|----------------|--------|
| `BATTLE_ROUND` | `IF battle.round <>/= X` | Current round number | Level 3 |
| `BATTLE_ADVANTAGE` | `IF team.total_health > enemy_team.total_health` | Are we winning? | Level 7 |
| `BATTLE_ARENA` | `IF arena.modifier = X` | What arena are we in? | Level 15 |

---

## 2. ACTION BLOCKS (18 total)

### Damage Actions (5 blocks)

| Block | Effect | Energy | Cooldown | Unlock |
|-------|--------|--------|----------|--------|
| `ATTACK` | Deal 10 damage to target | 1 | None | Starter |
| `HEAVY_ATTACK` | Deal 25 damage, but slower (acts last) | 2 | 2 rounds | Level 3 |
| `QUICK_ATTACK` | Deal 5 damage, but faster (acts first) | 1 | None | Level 5 |
| `CRITICAL_STRIKE` | Deal 40 damage, 50% chance to miss | 3 | 3 rounds | Level 10 |
| `AREA_ATTACK` | Deal 8 damage to ALL enemies | 4 | 4 rounds | Level 15 |

### Defense Actions (4 blocks)

| Block | Effect | Energy | Cooldown | Unlock |
|-------|--------|--------|----------|--------|
| `DEFEND` | Reduce incoming damage by 50% this round | 1 | None | Starter |
| `DODGE` | 70% chance to avoid next attack | 1 | 2 rounds | Level 4 |
| `COUNTER` | If attacked this round, deal 15 damage back | 2 | 2 rounds | Level 8 |
| `SHIELD_ALLY` | Take damage instead of target ally | 2 | 3 rounds | Level 12 |

### Support Actions (5 blocks)

| Block | Effect | Energy | Cooldown | Unlock |
|-------|--------|--------|----------|--------|
| `HEAL` | Restore 15 HP to target | 2 | 1 round | Starter |
| `BIG_HEAL` | Restore 35 HP to target | 4 | 3 rounds | Level 6 |
| `BUFF_DAMAGE` | Target deals +30% damage for 2 rounds | 2 | 3 rounds | Level 7 |
| `BUFF_DEFENSE` | Target takes -30% damage for 2 rounds | 2 | 3 rounds | Level 7 |
| `CLEANSE` | Remove all debuffs from target | 2 | 2 rounds | Level 11 |

### Debuff Actions (4 blocks)

| Block | Effect | Energy | Cooldown | Unlock |
|-------|--------|--------|----------|--------|
| `WEAKEN` | Target deals -30% damage for 2 rounds | 2 | 2 rounds | Level 6 |
| `SLOW` | Target acts last for 2 rounds | 2 | 2 rounds | Level 9 |
| `TAUNT` | Force target to attack you for 2 rounds | 3 | 3 rounds | Level 8 |
| `SILENCE` | Target can't use abilities (only basic attack) for 1 round | 3 | 4 rounds | Level 14 |

---

## 3. TARGET BLOCKS (8 total)

| Block | Who It Targets | Unlock |
|-------|----------------|--------|
| `NEAREST_ENEMY` | Closest enemy by position | Starter |
| `WEAKEST_ENEMY` | Enemy with lowest current HP | Starter |
| `STRONGEST_ENEMY` | Enemy with highest current HP | Level 2 |
| `ENEMY_DAMAGE_DEALER` | Enemy with highest damage output | Level 5 |
| `ENEMY_SUPPORT` | Enemy support type (if exists) | Level 5 |
| `WEAKEST_ALLY` | Ally with lowest current HP | Starter |
| `SELF` | Yourself | Starter |
| `RANDOM_ENEMY` | Random enemy (unpredictable) | Level 4 |

---

## 4. MODIFIER BLOCKS (7 total)

Modifiers attach to actions to change their behavior.

| Block | Effect | Unlock |
|-------|--------|--------|
| `WITH_PRIORITY` | This action executes before others | Level 6 |
| `IF_SUCCESSFUL` | Only continue chain if action succeeded | Level 8 |
| `REPEAT(X)` | Do this action X times (costs X energy) | Level 10 |
| `DELAY(X)` | Wait X rounds before executing | Level 12 |
| `CHAIN_INTO` | If this succeeds, immediately do next action | Level 14 |
| `ONLY_ONCE` | This rule can only trigger once per battle | Level 9 |
| `PERCENT_CHANCE(X)` | X% chance to execute (randomness) | Level 7 |

---

## 5. FLOW CONTROL BLOCKS (6 total)

### Logic Structure

| Block | What It Does | Unlock |
|-------|--------------|--------|
| `IF` | Check condition, do action if true | Starter |
| `ELIF` | Check if previous IF was false, then check this | Starter |
| `ELSE` | Do this if all above conditions false | Starter |
| `AND` | Both conditions must be true | Level 2 |
| `OR` | Either condition can be true | Level 2 |
| `NOT` | Invert condition (true becomes false) | Level 4 |

### Priority System

Rules are checked **top to bottom**. First matching rule executes.

```
PRIORITY 1: IF self.health < 20% → DEFEND
PRIORITY 2: IF ally.health < 30% → HEAL → WEAKEST_ALLY
PRIORITY 3: IF enemy.health < 30% → ATTACK → WEAKEST_ENEMY
PRIORITY 4: ELSE → ATTACK → NEAREST_ENEMY
```

Players drag rules up/down to set priority.

---

## 6. ADVANCED BLOCKS (5 total)

Unlocked at high levels for complex strategies.

| Block | What It Does | Unlock |
|-------|--------------|--------|
| `REMEMBER(var)` | Store a value (e.g., "marked_target") | Level 16 |
| `RECALL(var)` | Use stored value as target | Level 16 |
| `ON_ALLY_DEATH` | Trigger when any ally dies | Level 18 |
| `ON_SELF_HIT` | Trigger when you take damage | Level 15 |
| `COMBO(A→B)` | If A then B within 2 rounds, bonus effect | Level 20 |

### Example: Advanced Bot Using REMEMBER

```
PRIORITY 1: IF enemy.type = support AND NOT remembered("target")
            → REMEMBER("target", enemy)
            → ATTACK → REMEMBERED("target")

PRIORITY 2: IF remembered("target").alive
            → ATTACK → REMEMBERED("target")

PRIORITY 3: IF remembered("target").dead
            → FORGET("target")

PRIORITY 4: ELSE → ATTACK → NEAREST_ENEMY

// This bot marks the enemy support and focuses it until dead
```

---

## Block Unlock Progression

### Starter (Level 1) - 12 blocks
```
Conditions: ENEMY_HEALTH, ENEMY_TYPE, ALLY_HEALTH, SELF_HEALTH
Actions: ATTACK, DEFEND, HEAL
Targets: NEAREST_ENEMY, WEAKEST_ENEMY, WEAKEST_ALLY, SELF
Flow: IF, ELIF, ELSE
```
*Enough to make a basic bot. Simple but functional.*

### Early Game (Level 2-5) - +14 blocks
```
Level 2: ALLY_TYPE, STRONGEST_ENEMY, AND, OR
Level 3: ENEMY_DISTANCE, HEAVY_ATTACK, BATTLE_ROUND
Level 4: ALLY_NEEDS_HEAL, SELF_ENERGY, DODGE, RANDOM_ENEMY, NOT
Level 5: ENEMY_TARGETING_ME, ENEMY_TARGETING_ALLY, QUICK_ATTACK, ENEMY_DAMAGE_DEALER, ENEMY_SUPPORT
```
*Now can build reactive bots. Starting to get interesting.*

### Mid Game (Level 6-10) - +16 blocks
```
Level 6: ALLY_IN_DANGER, BIG_HEAL, WEAKEN, WITH_PRIORITY
Level 7: ALLY_ALIVE_COUNT, BATTLE_ADVANTAGE, BUFF_DAMAGE, BUFF_DEFENSE, PERCENT_CHANCE
Level 8: ENEMY_ACTION, SELF_LAST_ACTION, COUNTER, TAUNT, IF_SUCCESSFUL
Level 9: SLOW, ONLY_ONCE
Level 10: ENEMY_BUFF_STATUS, ALLY_BUFF_STATUS, SELF_BUFF_STATUS, CRITICAL_STRIKE, REPEAT
```
*Complex strategies emerge. Meta starts forming.*

### Late Game (Level 11-15) - +10 blocks
```
Level 11: CLEANSE
Level 12: ENEMY_COOLDOWN, SHIELD_ALLY, DELAY
Level 14: SILENCE, CHAIN_INTO
Level 15: AREA_ATTACK, BATTLE_ARENA, ON_SELF_HIT
```
*Advanced tactics. Counter-meta strategies.*

### Endgame (Level 16-20) - +4 blocks
```
Level 16: REMEMBER, RECALL
Level 18: ON_ALLY_DEATH
Level 20: COMBO
```
*Master-level play. True infinite complexity.*

---

## Emergent Complexity Examples

### Example 1: Simple vs Simple (Predictable)

```
BOT A (Starter):                BOT B (Starter):
IF enemy.health < 50%           IF self.health < 50%
  → ATTACK → WEAKEST              → DEFEND
ELSE                            ELSE
  → ATTACK → NEAREST              → ATTACK → NEAREST
```

**Result:** Predictable. A always attacks weak, B defends when hurt. Solved quickly.

---

### Example 2: Mid-Level Interaction (Interesting)

```
BOT A (Level 8):                     BOT B (Level 8):
IF enemy.is_targeting(self)          IF enemy.last_action = DEFEND
  → COUNTER                            → HEAVY_ATTACK → that_enemy
ELIF self.health < 30%               ELIF enemy.last_action = COUNTER
  → DEFEND                             → DEFEND (don't trigger counter!)
ELSE                                 ELSE
  → ATTACK → ENEMY_DAMAGE_DEALER       → ATTACK → WEAKEST_ENEMY
```

**Result:**
- A counters when targeted
- B learns A has counter, switches to DEFEND to bait it out
- A's counter is wasted
- B then uses HEAVY_ATTACK
- But if A anticipated this...

**This creates read/counter-read mindgames!**

---

### Example 3: Team Synergy (Complex)

```
BOT A (Support):                    BOT B (Damage):
IF ally.health < 40%                IF self.has_buff(damage)
  → BIG_HEAL → WEAKEST_ALLY           → CRITICAL_STRIKE → STRONGEST_ENEMY
ELIF ally.type = damage AND         ELIF ally.type = support
     NOT ally.has_buff(damage)        → ATTACK → ENEMY_SUPPORT (protect healer)
  → BUFF_DAMAGE → ally              ELSE
ELIF enemy.has_buff(any)              → ATTACK → NEAREST_ENEMY
  → CLEANSE_ENEMY (custom?)
ELSE
  → HEAL → WEAKEST_ALLY
```

**Result:**
- Support buffs Damage dealer
- Damage dealer waits for buff, then crits
- If enemy focuses Support, Damage dealer peels
- Team coordination without communication!

---

### Example 4: Advanced Memory Bot (Endgame)

```
ASSASSIN BOT (Level 20):

PRIORITY 1:
  IF battle.round = 1
    → REMEMBER("primary_target", ENEMY_SUPPORT)
    → QUICK_ATTACK → REMEMBERED("primary_target")

PRIORITY 2:
  IF REMEMBERED("primary_target").health < 30%
    → CRITICAL_STRIKE → REMEMBERED("primary_target")
    → CHAIN_INTO → ATTACK (execute combo)

PRIORITY 3:
  IF REMEMBERED("primary_target").dead
    → REMEMBER("primary_target", ENEMY_DAMAGE_DEALER)

PRIORITY 4:
  IF self.health < 25%
    → DODGE
    → DELAY(1) → ATTACK (hit and run)

PRIORITY 5:
  ELSE
    → ATTACK → REMEMBERED("primary_target")
```

**Result:**
- Marks support turn 1
- Focuses support until dead
- Switches to damage dealer
- Has escape plan if low
- Chains abilities for burst

**This is a completely custom AI personality!**

---

## Why 66 Blocks = Infinite Variety

### Math

```
Conditions: 22 options
Actions: 18 options
Targets: 8 options
Modifiers: 7 options

Simple rule (Condition → Action → Target):
22 × 18 × 8 = 3,168 unique simple rules

With modifiers:
3,168 × 7 = 22,176 unique modified rules

With AND/OR combinations (2 conditions):
22 × 22 × 18 × 8 = 69,696 two-condition rules

Bot with 5 priority rules:
22,176^5 = 5.2 × 10^21 possible bots
```

**5 sextillion possible bot configurations.**

Even if 99.99% are bad/suboptimal, that leaves **520 quadrillion** viable strategies.

---

## Meta Evolution Map

```
WEEK 1: "Aggro Meta"
├── Everyone runs damage bots
├── ATTACK → WEAKEST dominates
└── Matches are short, aggressive

WEEK 2: "Tank Meta" (Counter)
├── Players add DEFEND and COUNTER
├── Tank bots survive aggro
└── Matches get longer

WEEK 3: "Burst Meta" (Counter-counter)
├── CRITICAL_STRIKE + CHAIN_INTO
├── Kill tanks before they can defend
└── Glass cannon builds

WEEK 4: "Support Meta" (Counter-counter-counter)
├── HEAL + CLEANSE keeps team alive
├── Sustain beats burst
└── 2 Support + 1 Damage teams

WEEK 5: "Assassin Meta" (Counter again)
├── REMEMBER + target support first
├── Kill healers before they heal
└── Back to aggro but smarter

WEEK 6+: Rock-paper-scissors stabilizes
├── Aggro beats Support
├── Support beats Tank
├── Tank beats Assassin
├── Assassin beats Support
└── No single dominant strategy
```

**The meta NEVER solves because there's always a counter.**

---

## Arena Modifiers (Change Optimal Strategy)

| Arena | Effect | Meta Impact |
|-------|--------|-------------|
| **Standard** | No modifiers | Balanced |
| **Berserker** | All damage +50%, all healing -50% | Aggro OP |
| **Fortress** | All defense +50%, all damage -25% | Tank OP |
| **Quickdraw** | QUICK_ATTACK always crits | Speed OP |
| **Marathon** | 10 rounds, energy regen +100% | Sustain OP |
| **Fog** | Can only target NEAREST_ENEMY | Positioning OP |
| **Chaos** | Random modifier each round | Adaptable bots OP |
| **Mirror** | Both teams have same composition | Pure strategy |
| **Boss Rush** | Enemy team has 1 bot with 3x stats | Focus fire OP |
| **Protect the VIP** | One ally has 50% HP but 2x damage | Protect strats OP |

**Your "perfect" bot for Standard might be trash in Berserker.**

Players need multiple bot builds for different arenas.

---

## Block Balance Levers

When something is OP, we can adjust:

| Lever | Example Nerf |
|-------|--------------|
| **Energy cost** | CRITICAL_STRIKE: 3 → 4 energy |
| **Cooldown** | COUNTER: 2 → 3 rounds |
| **Effect strength** | HEAL: 15 → 12 HP |
| **Condition strictness** | ENEMY_HEALTH < 30% → < 25% |
| **Unlock level** | Move OP block to higher level |

**Weekly balance patches keep meta fresh.**

---

## Preventing "Solved" Meta

| Problem | Solution |
|---------|----------|
| One bot dominates | Nerf it, buff counters |
| Everyone copies same build | Add new blocks that counter it |
| Battles feel same | Rotate arena modifiers weekly |
| High-level only meta | Separate leagues by block access |
| Stale for veterans | Monthly new blocks, seasonal resets |

---

## Summary

```
66 TOTAL BLOCKS
├── 22 Conditions (what to check)
├── 18 Actions (what to do)
├── 8 Targets (who to affect)
├── 7 Modifiers (how to modify)
├── 6 Flow Control (logic structure)
└── 5 Advanced (complex behaviors)

UNLOCK PROGRESSION
├── Starter: 12 blocks (simple but functional)
├── Level 2-5: +14 blocks (reactive strategies)
├── Level 6-10: +16 blocks (complex meta)
├── Level 11-15: +10 blocks (advanced tactics)
└── Level 16-20: +4 blocks (master-level)

INFINITE VARIETY FROM
├── 5+ sextillion possible bot configurations
├── 10 arena modifiers changing optimal strategy
├── Team composition variance
├── Weekly balance patches
├── Monthly new block releases
└── Counter-meta evolution
```

**This is enough depth to stay fresh for years.**
