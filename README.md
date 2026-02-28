# Tome

**Tabletop Open Markup for Entities** -- a universal RPG entity format.

Think of it like `package.json` but for tabletop RPG data. Tome gives you a
consistent, portable way to represent characters, NPCs, items, locations, and
other game entities across any game system.

---

## Two-Layer Architecture

Tome separates **rules** from **data**.

```
Systems  (the rules)   -- what attributes exist, valid die values, edges, etc.
Entities (the data)    -- actual character or item values, keyed to a system
```

A **System** file defines the schema for a game system: its attributes, skills,
edges, hindrances, derived stat formulas, resource pools, and character creation
rules. An **Entity** file holds the actual values for a specific character or
item, and references the System it belongs to via `meta.system`.

This means you can validate a Savage Worlds character against the SWADE rules,
or a Titan Effect Zero character against its system, using the same library.

---

## Quick Start

### Install

```bash
npm install tome
# or
yarn add tome
```

### Creating an entity

```typescript
import { Entity, EntityType } from 'tome';

const character = new Entity('Mira Voss', EntityType.Character, {
  system: 'savage-worlds-swade',
  tags: ['player-character'],
});

character
  .addStaticProperty('agility', 8)   // d8 in SWADE
  .addStaticProperty('fighting', 6)  // d6 Fighting skill
  .addResource('wounds', { current: 0, maximum: 3, minimum: 0 })
  .addResource('bennies', { current: 3, minimum: 0 });

console.log(character.toJSON());
```

### Loading a game system

```typescript
import { System } from 'tome';
import { readFileSync } from 'fs';

const yaml = readFileSync('systems/savage-worlds-swade.yaml', 'utf-8');
const swade = System.fromYAML(yaml, 'savage-worlds-swade');

console.log(swade.name);          // "Savage Worlds Adventure Edition"
console.log(swade.getValidDice()); // [4, 6, 8, 10, 12]
console.log(swade.getAttribute('agility')); // { label: 'Agility', die: 6 }
```

### System-aware validation

```typescript
const result = character.validateWithSystem(swade);

if (!result.valid) {
  result.errors.forEach(e => console.error(e.path, e.message));
}
if (result.warnings) {
  result.warnings.forEach(w => console.warn(w.path, w.message));
}
```

---

## File Formats

### Entity file (`.tome.json`)

```json
{
  "tome": { "version": "1.0.0", "format": "entity" },
  "meta": {
    "id": "uuid-here",
    "type": "character",
    "system": "savage-worlds-swade"
  },
  "identity": {
    "name": { "primary": "Mira Voss" }
  },
  "properties": {
    "static": { "agility": 8, "fighting": 6 }
  },
  "resources": {
    "wounds":  { "current": 0, "maximum": 3, "minimum": 0 },
    "bennies": { "current": 3, "minimum": 0 }
  }
}
```

### System file (`.system.yaml`)

```yaml
tome:
  version: "1.0.0"
  format: system

meta:
  id: savage-worlds-swade
  name: Savage Worlds Adventure Edition
  engine: savage-worlds

mechanics:
  dice: [4, 6, 8, 10, 12]
  roll_type: step

attributes:
  agility: { label: Agility, die: 6 }
  vigor:   { label: Vigor,   die: 6 }

skills:
  fighting: { label: Fighting, attribute: agility }
```

---

## Bundled Systems

| File | System | Engine |
|------|--------|--------|
| `systems/savage-worlds-swade.yaml` | Savage Worlds Adventure Edition | savage-worlds |
| `systems/year-zero-engine-base.yaml` | Year Zero Engine | year-zero-engine |
| `systems/titan-effect-zero.yaml` | Titan Effect Zero | year-zero-engine |

---

## Converters

Two converters are included for importing character data from other tools:

- **`converters/savaged-to-tome.ts`** -- converts a `savaged-core` PlayerCharacter
  export to a Tome entity referencing `savage-worlds-swade`
- **`converters/yzh-to-tome.ts`** -- converts a Year Zero Hero (YZH) character
  JSON export to a Tome entity referencing `titan-effect-zero`

```typescript
import { savegedToTome } from 'tome/converters/savaged-to-tome';
import { yzhToTome }     from 'tome/converters/yzh-to-tome';
```

---

## API

### `Entity`

| Method | Description |
|--------|-------------|
| `new Entity(name, type, opts?)` | Create a new entity |
| `Entity.fromJSON(json)` | Load from JSON string |
| `Entity.fromData(data)` | Load from TomeEntity object |
| `.addStaticProperty(key, value)` | Set a static (base) property |
| `.addDynamicProperty(key, value)` | Set a dynamic (current) property |
| `.addComputedProperty(key, value)` | Set a computed/derived property |
| `.addResource(key, resource)` | Add a resource pool |
| `.addPassive(capability)` | Add a passive capability (edge, trait) |
| `.validate()` | Validate against the Tome schema |
| `.validateWithSystem(system)` | Validate against schema + game system |
| `.toJSON(opts?)` | Export to JSON string |
| `.clone()` | Clone with a new ID |

### `System`

| Method | Description |
|--------|-------------|
| `System.fromYAML(yaml, id)` | Load from YAML string |
| `System.fromJSON(json)` | Load from JSON string |
| `System.fromData(data)` | Load from GameSystem object |
| `.id` | System id |
| `.name` | System name |
| `.getAttribute(id)` | Look up an attribute definition |
| `.getSkill(id)` | Look up a skill definition |
| `.getEdge(id)` | Look up an edge definition |
| `.getHindrance(id)` | Look up a hindrance definition |
| `.getValidDice()` | List of valid die sizes |
| `.isStepSystem()` | True for step-die systems (Savage Worlds) |
| `.isPoolSystem()` | True for dice-pool systems (YZE) |
| `.toJSON()` | Serialize to JSON string |

---

## License

MIT
