# 📚 Tome - Tabletop Open Markup for Entities

**Universal, open-source data format for tabletop RPG entities**

Tome is a system-agnostic format for representing any RPG entity (characters, items, locations, vehicles, NPCs, creatures, abilities) that works across any game system without vendor lock-in.

## Why Tome?

- **Universal** - Works with D&D, Pathfinder, GURPS, Cyberpunk, homebrew, or any RPG system
- **Semantic** - Uses clear terminology (properties, capabilities, resources) instead of system-specific jargon
- **Git-friendly** - Clean JSON format with meaningful diffs
- **Extensible** - Use only what you need, extend anything
- **Open** - MIT licensed, community-driven, no vendor lock-in
- **Entity-based** - Not just characters - items, locations, vehicles, anything

## Quick Start

### Using the Web Editor

1. Open `editor/index.html` in your browser
2. Fill in your entity details
3. Click "Save .tome" to download
4. Load existing .tome files with "Load .tome"

### Using the Library

```typescript
import { Entity, EntityType } from 'tome';

// Create a new entity
const hero = new Entity('Alaric the Brave', EntityType.Character, {
  system: 'Custom Fantasy',
  description: 'A wandering knight',
  tags: ['warrior', 'noble', 'human'],
});

// Add properties
hero.addStaticProperty('might', 18);
hero.addStaticProperty('agility', 14);
hero.addDynamicProperty('morale', 85);

// Add resources
hero.addResource('vitality', {
  current: 45,
  maximum: 50,
});

// Add capabilities
hero.addAction({
  id: 'power-strike',
  name: 'Power Strike',
  description: 'A devastating melee attack',
  costs: { stamina: 10 },
});

// Validate and export
const validation = hero.validate();
if (validation.valid) {
  const json = hero.toJSON();
  console.log(json);
}
```

## File Formats

### .tome - Single Entity (JSON)

A standalone JSON file containing one entity:

```json
{
  "tome": {
    "version": "1.0.0",
    "format": "entity"
  },
  "meta": {
    "id": "uuid-here",
    "type": "character",
    "created": "2025-01-15T12:00:00.000Z",
    "modified": "2025-01-15T12:00:00.000Z",
    "tags": ["warrior", "human"]
  },
  "identity": {
    "name": {
      "primary": "Alaric the Brave"
    },
    "description": {
      "short": "A wandering knight"
    }
  },
  "properties": {
    "static": {
      "might": 18,
      "agility": 14
    }
  },
  "resources": {
    "vitality": {
      "current": 45,
      "maximum": 50
    }
  }
}
```

### .tomes - Container (ZIP)

A ZIP file containing multiple entities plus media:

```
campaign.tomes/
├── manifest.json          # Container metadata
├── entities/
│   ├── hero-001.json
│   ├── villain-001.json
│   └── sword-of-power.json
└── media/
    ├── hero-portrait.png
    └── sword-icon.png
```

### .tomex - Exchange Format (Future)

Signed/encrypted format for secure trading and distribution.

## Core Concepts

### System-Agnostic Design

Tome doesn't use game-specific terminology. Instead of "hit points" or "armor class", it uses:

- **Properties** - Characteristics (might, speed, size, etc.)
- **Capabilities** - Actions, reactions, passive abilities
- **Resources** - Pools like health, energy, ammunition
- **Classification** - Role, species, rank (your terms, not ours)

### Flexible Values

Values can be numbers, strings, or formulas:

```json
{
  "properties": {
    "static": {
      "might": 18,
      "height": "6'2\"",
      "reputation": "excellent",
      "damage": "2d6+4"
    }
  }
}
```

### Progressive Disclosure

Start simple, add complexity as needed:

```typescript
// Minimal entity
const item = new Entity('Magic Sword', EntityType.Item);

// Add more detail over time
item.addStaticProperty('damage', '1d8+2');
item.addAction({
  id: 'flame-burst',
  name: 'Flame Burst',
  description: 'Release a burst of flame',
});
```

## Schema Structure

### Required Fields

Only these fields are required:

```json
{
  "tome": {
    "version": "1.0.0",
    "format": "entity"
  },
  "meta": {
    "id": "unique-id",
    "type": "character"
  },
  "identity": {
    "name": {
      "primary": "Entity Name"
    }
  }
}
```

### Full Structure

```json
{
  "tome": {
    "version": "1.0.0",
    "format": "entity"
  },
  "meta": {
    "id": "uuid",
    "type": "character|item|location|vehicle|npc|creature|ability",
    "created": "ISO-8601 date",
    "modified": "ISO-8601 date",
    "tags": ["tag1", "tag2"],
    "system": "D&D 5e"
  },
  "identity": {
    "name": {
      "primary": "Name",
      "alternate": ["Alias"],
      "pronunciation": "How to say it"
    },
    "classification": {
      "race": "Elf",
      "class": "Wizard",
      "level": 5
    },
    "description": {
      "short": "One-liner",
      "full": "Detailed description",
      "appearance": "What they look like"
    }
  },
  "properties": {
    "static": {
      "might": 18
    },
    "dynamic": {
      "morale": 85
    },
    "computed": {
      "carryCapacity": 180
    }
  },
  "capabilities": {
    "actions": [
      {
        "id": "fireball",
        "name": "Fireball",
        "description": "Hurl a ball of fire",
        "costs": { "mana": 15 }
      }
    ],
    "reactions": [],
    "passive": []
  },
  "resources": {
    "health": {
      "current": 45,
      "maximum": 50
    }
  },
  "inventory": {
    "items": [
      {
        "id": "sword-001",
        "name": "Iron Sword",
        "quantity": 1,
        "equipped": true
      }
    ]
  },
  "narrative": {
    "background": "Once upon a time...",
    "personality": "Brave and loyal"
  },
  "extensions": {
    "dnd5e": {
      "proficiencyBonus": 3
    }
  }
}
```

## Examples

### Fantasy RPG Character

```typescript
const wizard = new Entity('Gandalf', EntityType.Character, {
  system: 'Fantasy',
  tags: ['wizard', 'magic', 'wise'],
});

wizard.setClassification({
  species: 'Maiar',
  order: 'Istari',
  power: 'legendary',
});

wizard.addStaticProperty('intellect', 20);
wizard.addStaticProperty('wisdom', 22);

wizard.addResource('magicPower', {
  current: 100,
  maximum: 100,
  regeneration: { rate: 10, interval: 'hour' },
});

wizard.addAction({
  id: 'cast-spell',
  name: 'Cast Spell',
  description: 'Channel arcane energy',
  costs: { magicPower: 15 },
});
```

### Sci-Fi Starship

```typescript
const ship = new Entity('USS Enterprise', EntityType.Vehicle, {
  system: 'Star Trek',
  tags: ['starship', 'federation', 'exploration'],
});

ship.setClassification({
  class: 'Constitution',
  registry: 'NCC-1701',
  crew: 430,
});

ship.addStaticProperty('warpSpeed', '9.5');
ship.addStaticProperty('weapons', 'phasers, photon torpedoes');

ship.addResource('shields', {
  current: 100,
  maximum: 100,
  type: 'pool',
});

ship.addAction({
  id: 'warp-jump',
  name: 'Warp Jump',
  description: 'Engage warp drive to another system',
  costs: { antimatter: 50 },
});
```

### Simple Item

```typescript
const sword = new Entity('Excalibur', EntityType.Item, {
  system: 'Arthurian Legend',
  tags: ['weapon', 'legendary', 'sword'],
});

sword.addStaticProperty('damage', 'legendary');
sword.addStaticProperty('weight', '10 lbs');

sword.addPassive({
  id: 'rightful-king',
  name: 'Blade of the Rightful King',
  description: 'Cannot be wielded by the unworthy',
});
```

## Converting From Other Formats

See `converters/` for example converters:

```typescript
import { dnd5eToTome, tomeToD nd5e } from './converters/dnd5e-to-tome';

// Convert D&D character to Tome
const dndCharacter = { /* D&D data */ };
const tomeEntity = dnd5eToTome(dndCharacter);

// Convert back
const reconstructed = tomeToD nd5e(tomeEntity);
```

## Display Formats

Convert Tome to various display formats:

```typescript
import { tomeToText, tomeToHTML, tomeToMarkdown } from './converters/tome-to-display';

const entity = new Entity('Hero', EntityType.Character);
// ... populate entity

// Plain text
console.log(tomeToText(entity.getData()));

// HTML
document.body.innerHTML = tomeToHTML(entity.getData());

// Markdown
const markdown = tomeToMarkdown(entity.getData());
```

## API Reference

### Entity Class

```typescript
// Create entity
const entity = new Entity(name: string, type: EntityType, options?);

// Static methods
Entity.fromData(data: TomeEntity): Entity
Entity.fromJSON(json: string): Entity

// Methods
entity.setName(name: string): this
entity.setClassification(classification: Record<string, any>): this
entity.setDescription(description: {...}): this
entity.addStaticProperty(key: string, value: any): this
entity.addDynamicProperty(key: string, value: any): this
entity.addComputedProperty(key: string, value: any): this
entity.addAction(action: Capability): this
entity.addReaction(reaction: Capability): this
entity.addPassive(passive: Capability): this
entity.addResource(key: string, resource: Resource): this
entity.addInventoryItem(item: InventoryItem): this
entity.addTag(tag: string): this
entity.validate(): ValidationResult
entity.toJSON(options?: ExportOptions): string
entity.clone(): Entity
```

### Container Class

```typescript
// Create container
const container = new Container(name: string, options?);

// Static methods
Container.fromData(data: TomeContainer, mediaFiles?): Container
Container.fromZip(arrayBuffer: ArrayBuffer): Promise<Container>

// Methods
container.addEntity(entity: Entity | TomeEntity): this
container.removeEntity(entityId: string): this
container.getEntities(): TomeEntity[]
container.getEntity(entityId: string): TomeEntity | undefined
container.addMedia(media: MediaFile): this
container.removeMedia(mediaId: string): this
container.validate(): ValidationResult
container.toZip(): Promise<Blob>
container.toJSON(options?: ExportOptions): string
```

## Development

### Build

```bash
yarn install
yarn build
```

### Run Editor Locally

```bash
# Open editor/index.html in your browser
# No build step required - it's standalone!
```

## Design Principles

1. **Minimal Required Fields** - Only tome, meta.id, meta.type, and identity.name are required
2. **Flexible Values** - Accept numbers, strings, formulas ("18", "d20", "excellent")
3. **No System Assumptions** - Don't assume combat, magic, levels, or any specific mechanics
4. **Human Readable** - Should make sense when read as JSON
5. **Progressive Disclosure** - Start simple, add complexity as needed
6. **Git Friendly** - Clean diffs, no binary formats (except .tomes ZIP)
7. **Zero Vendor Lock-in** - Open format, open source, community-owned

## Use Cases

- **Character Management** - Store characters across different campaigns and systems
- **Content Creation** - Create NPCs, items, and locations for your game
- **Campaign Tools** - Build campaign management tools with standard format
- **Converters** - Build tools to convert between different RPG systems
- **Archives** - Preserve game content in an open, long-term format
- **Sharing** - Share entities with other players and GMs
- **Integration** - Integrate with virtual tabletops, character builders, etc.

## Contributing

Tome is a community project! Contributions welcome:

- Submit issues and feature requests
- Create converters for your favorite RPG system
- Improve documentation
- Build tools that use Tome format

## License

MIT License - Use freely in commercial and personal projects

## FAQ

**Q: Does Tome support [specific game system]?**
A: Tome supports ALL game systems by design. It's system-agnostic.

**Q: Why not just use JSON?**
A: Tome IS JSON, but with a standardized schema that tools can understand.

**Q: Can I add custom fields?**
A: Yes! Use the `extensions` section for system-specific data.

**Q: How do I convert my D&D character?**
A: See `converters/dnd5e-to-tome.ts` for an example converter.

**Q: Is this compatible with [virtual tabletop]?**
A: Build a converter! The format is designed to be convertible.

**Q: What about images and media?**
A: Use .tomes (ZIP) format to bundle entities with images.

**Q: Can I use this commercially?**
A: Yes! MIT license allows commercial use.

---

**Tome** - Because your characters deserve better than vendor lock-in.
