# Getting Started with Tome

## Quick Start

### 1. Try the Web Editor (No Installation Required!)

The easiest way to get started is with the web editor:

1. Open `editor/index.html` in your web browser
2. Start creating entities immediately
3. Export as `.tome` files

### 2. Install the Library

```bash
cd tome
yarn install
yarn build
```

### 3. Use in Your Project

```typescript
import { Entity, EntityType } from './dist/index.js';

// Create a character
const hero = new Entity('Aragorn', EntityType.Character, {
  system: 'Fantasy RPG',
  tags: ['warrior', 'ranger', 'human'],
});

// Add properties
hero.addStaticProperty('strength', 18);
hero.addStaticProperty('dexterity', 16);

// Add resources
hero.addResource('health', {
  current: 85,
  maximum: 100,
});

// Add an action
hero.addAction({
  id: 'sword-strike',
  name: 'Sword Strike',
  description: 'A powerful melee attack',
  costs: { stamina: 5 },
});

// Validate and export
const validation = hero.validate();
if (validation.valid) {
  const json = hero.toJSON();
  console.log(json);
}
```

## Project Structure

```
tome/
├── src/                  # TypeScript source code
│   ├── types.ts         # Type definitions
│   ├── Entity.ts        # Entity class
│   ├── Container.ts     # Container class (.tomes)
│   ├── validation.ts    # Validation logic
│   ├── io.ts           # File I/O utilities
│   └── index.ts        # Main export
├── dist/                # Compiled JavaScript
├── editor/              # Standalone web editor
│   ├── index.html      # Editor UI
│   ├── editor.css      # Styles
│   └── editor.js       # Editor logic
├── examples/            # Example .tome files
│   ├── fantasy-character.tome
│   ├── scifi-starship.tome
│   └── simple-item.tome
├── converters/          # Example converters
│   ├── dnd5e-to-tome.ts
│   └── tome-to-display.ts
├── README.md           # Full documentation
└── package.json        # Project config
```

## Key Concepts

### 1. System-Agnostic Design

Tome doesn't force any game system's terminology:

- ✅ **Properties** (might, speed, size)
- ✅ **Capabilities** (actions, reactions, passive)
- ✅ **Resources** (pools like health, mana, ammo)
- ❌ NOT "hit points", "armor class", "proficiency"

### 2. Flexible Values

```json
{
  "properties": {
    "static": {
      "might": 18,           // number
      "height": "6'2\"",     // string
      "reputation": "excellent", // descriptive
      "damage": "2d6+4"      // formula
    }
  }
}
```

### 3. Only 4 Required Fields

```json
{
  "tome": { "version": "1.0.0", "format": "entity" },
  "meta": { "id": "unique-id", "type": "character" },
  "identity": { "name": { "primary": "Name" } }
}
```

Everything else is optional!

## Common Tasks

### Create a Character

```typescript
const wizard = new Entity('Gandalf', EntityType.Character, {
  system: 'Middle-earth',
  tags: ['wizard', 'maiar', 'istari'],
});

wizard.setClassification({
  race: 'Maiar',
  order: 'Istari',
});

wizard.addStaticProperty('wisdom', 20);
wizard.addResource('magicPower', { current: 100, maximum: 100 });
```

### Create a Starship

```typescript
const ship = new Entity('Enterprise', EntityType.Vehicle, {
  system: 'Star Trek',
  tags: ['starship', 'explorer'],
});

ship.addStaticProperty('warpSpeed', '9.5');
ship.addResource('shields', { current: 100, maximum: 100 });
ship.addAction({
  id: 'warp-jump',
  name: 'Warp Jump',
  description: 'Engage warp drive',
  costs: { fuel: 50 },
});
```

### Create a Magic Item

```typescript
const sword = new Entity('Excalibur', EntityType.Item, {
  tags: ['weapon', 'legendary'],
});

sword.addStaticProperty('damage', '2d8+2');
sword.addPassive({
  id: 'rightful-king',
  name: 'Blade of the Rightful King',
  description: 'Only the worthy may wield this blade',
});
```

### Load and Validate Files

```typescript
import { loadEntity, validateFile } from './dist/io.js';

// Load from file
const file = /* File from input */;
const entity = await loadEntity(file);

// Or validate first
const validation = await validateFile(file);
if (validation.valid) {
  console.log('Valid Tome file!');
} else {
  console.error('Errors:', validation.errors);
}
```

### Create a Container with Multiple Entities

```typescript
import { Container } from './dist/Container.js';

const campaign = new Container('My Campaign', {
  description: 'A high fantasy adventure',
  author: 'Game Master',
});

campaign.addEntity(hero);
campaign.addEntity(villain);
campaign.addEntity(magicSword);

// Add media files
campaign.addMedia({
  id: 'hero-portrait',
  filename: 'hero.png',
  type: 'image/png',
  data: /* Blob or ArrayBuffer */,
  purpose: 'portrait',
  relatedEntity: hero.getId(),
});

// Save as .tomes file
const blob = await campaign.toZip();
// Download or save blob
```

## Next Steps

1. **Explore Examples**: Check out `examples/` for real-world entities
2. **Try Converters**: See `converters/` for D&D 5e conversion examples
3. **Build Tools**: Create your own converters and integrations
4. **Read API Docs**: See README.md for full API reference
5. **Contribute**: Add converters for your favorite RPG system!

## FAQ

**Q: Can I use this with D&D Beyond / Roll20 / etc?**
A: Not directly, but you can write a converter! See `converters/` for examples.

**Q: What if my game system has unique mechanics?**
A: Use the `extensions` field to add system-specific data.

**Q: Is this only for fantasy RPGs?**
A: No! Works with sci-fi, modern, horror, any genre.

**Q: Can I embed images?**
A: Use the `.tomes` (ZIP) format to bundle entities with media files.

**Q: Is this compatible with [X]?**
A: Tome is a data format. Write a converter to/from [X]!

## Resources

- **Full Documentation**: README.md
- **Examples**: examples/
- **Web Editor**: editor/index.html
- **Converters**: converters/
- **License**: MIT (see LICENSE)

---

**Happy gaming! May your entities be portable and your data never vendor-locked. 🎲**
