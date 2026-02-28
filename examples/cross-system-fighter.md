# Cross-System Fighter: The Same Character Across Four Systems

This document shows how Tome's generic vocabulary maps to system-specific
labels via `getTerm()`. The underlying data uses the same generic keys
(`traits`, `positive_traits`, etc.) in all four cases. Only the display
labels change.

---

## The Archetype

A tough, weapon-focused warrior. Brave but quick-tempered. Excels in direct
combat; not subtle.

---

## SWADE (Savage Worlds Adventure Edition)

```yaml
meta:
  system: savage-worlds-swade

identity:
  name:
    primary: Kael Ironborn

# system.getTerm('attributes')     => "Traits"
# system.getTerm('positive_traits') => "Edges"
# system.getTerm('negative_traits') => "Hindrances"
# system.getTerm('character_points') => "Advances"

properties:
  static:
    agility: { die: 6 }
    smarts:  { die: 4 }
    spirit:  { die: 6 }
    strength: { die: 10 }
    vigor:   { die: 8 }

# Displayed as "Edges" on the sheet
traits_positive:
  - id: brawny
  - id: combat_reflexes
  - id: first_strike

# Displayed as "Hindrances" on the sheet
traits_negative:
  - id: stubborn
  - id: vengeful
```

---

## D&D 5e

```yaml
meta:
  system: dnd-5e

identity:
  name:
    primary: Kael Ironborn

# system.getTerm('attributes')      => "Ability Scores"
# system.getTerm('positive_traits')  => "Feats"
# system.getTerm('negative_traits')  => "Flaws"
# system.getTerm('character_points') => "XP"

properties:
  static:
    strength:     16
    dexterity:    12
    constitution: 15
    intelligence: 8
    wisdom:       10
    charisma:     10

# Displayed as "Feats" on the sheet
traits_positive:
  - id: great_weapon_master
  - id: tough

# Displayed as "Flaws" on the sheet
traits_negative:
  - id: cowardly    # ironic -- he would call it righteous fury
  - id: greedy
```

---

## GURPS 4e

```yaml
meta:
  system: gurps-4e

identity:
  name:
    primary: Kael Ironborn

# system.getTerm('attributes')      => "Attributes"
# system.getTerm('positive_traits')  => "Advantages"
# system.getTerm('negative_traits')  => "Disadvantages"
# system.getTerm('character_points') => "Character Points"

properties:
  static:
    strength:     14   # 40 points
    dexterity:    12   # 40 points
    intelligence: 9    # -20 points
    health:       12   # 20 points

# Displayed as "Advantages" on the sheet
traits_positive:
  - id: combat_reflexes   # 15 pts
  - id: ambidexterity     # 5 pts

# Displayed as "Disadvantages" on the sheet
traits_negative:
  - id: bad_temper        # -10 pts
  - id: cowardice         # -10 pts (he fears being seen as weak, actually)
```

---

## Fate Core

```yaml
meta:
  system: fate-core

identity:
  name:
    primary: Kael Ironborn

# system.getTerm('skills')           => "Skills"
# system.getTerm('positive_traits')  => "Stunts"
# system.getTerm('neutral_traits')   => "Aspects"
# system.getTerm('character_points') => "Fate Points"
# system.getTerm('resources')        => "Stress"

properties:
  static:
    fight:    4   # Great
    physique: 3   # Good
    athletics: 2  # Fair
    provoke:  2   # Fair
    will:     1   # Average

# Displayed as "Aspects" on the sheet
traits_neutral:
  - label: "Born to the Blade"
  - label: "My Word is My Bond (Unless You Cross Me)"
  - label: "One More Scar Won't Matter"

# Displayed as "Stunts" on the sheet
traits_positive:
  - id: danger_sense
  - label: Weapon Specialist
    description: +2 to Fight rolls when using a two-handed weapon.
    effects:
      - { type: bonus, target: fight, value: 2 }
```

---

## How getTerm() Works

```typescript
import { System } from 'tome';
import fs from 'fs';

const swade = System.fromYAML(fs.readFileSync('systems/savage-worlds-swade.yaml', 'utf8'), 'savage-worlds-swade');
const dnd   = System.fromYAML(fs.readFileSync('systems/dnd-5e.yaml', 'utf8'), 'dnd-5e');
const gurps = System.fromYAML(fs.readFileSync('systems/gurps-4e.yaml', 'utf8'), 'gurps-4e');
const fate  = System.fromYAML(fs.readFileSync('systems/fate-core.yaml', 'utf8'), 'fate-core');

// Same generic key, different display labels:
console.log(swade.getTerm('positive_traits')); // "Edges"
console.log(dnd.getTerm('positive_traits'));   // "Feats"
console.log(gurps.getTerm('positive_traits')); // "Advantages"
console.log(fate.getTerm('positive_traits'));  // "Stunts"

console.log(swade.getTerm('attributes'));      // "Traits"
console.log(dnd.getTerm('attributes'));        // "Ability Scores"
console.log(gurps.getTerm('attributes'));      // "Attributes"

console.log(swade.getTerm('character_points')); // "Advances"
console.log(gurps.getTerm('character_points')); // "Character Points"
console.log(fate.getTerm('character_points'));  // "Fate Points"
```

A character sheet renderer calls `system.getTerm(key)` for every section
header and field label. The data layer stays generic; the display layer
speaks each system's native language.
