# Tome Core Library

The Tome Core Library provides a complete TypeScript/JavaScript API for working with `.tome` entity files.

## ✅ What's Built

### Core Classes

- **Entity** - Main class for creating and manipulating RPG entities
- **Container** - Handles `.tomes` files (ZIP format with multiple entities + media)

### Features

- ✅ Full TypeScript support with type definitions
- ✅ Entity creation and manipulation
- ✅ Property management (static, dynamic, computed)
- ✅ Resource tracking (health, mana, etc.)
- ✅ Capabilities system (actions, reactions, passive)
- ✅ Inventory management
- ✅ JSON import/export
- ✅ Entity validation
- ✅ Clone functionality
- ✅ Container/ZIP support for multiple entities with media

## 🚀 Quick Start

```javascript
import { Entity, EntityType } from 'tome';

// Create a character
const character = new Entity('Thorin Ironshield', EntityType.Character, {
  tags: ['dwarf', 'warrior'],
  system: 'D&D 5e'
});

// Add properties
character
  .setProperty('strength', 18, 'static')
  .setProperty('level', 5, 'dynamic');

// Add resources
character.setResource('health', { current: 65, maximum: 65 });

// Add capabilities
character.addCapability('action', {
  name: 'Power Attack',
  description: 'Deal extra damage',
  costs: { stamina: 5 }
});

// Export to JSON
const json = character.toJSON();

// Validate
const result = character.validate();
console.log('Valid:', result.valid);
```

## 📦 Build

```bash
yarn build       # Compile TypeScript to dist/
yarn watch       # Watch mode for development
yarn test        # Run tests
```

## 📄 Output

Build outputs CommonJS modules to `dist/`:
- `dist/index.js` - Main entry point
- `dist/index.d.ts` - TypeScript type definitions
- `dist/**/*.js` - All compiled modules

## 🎯 API Reference

See the comprehensive integration guide at `/editor/docs.html` for:
- VTT integration examples
- Character editor integration
- Cross-system conversion
- Advanced techniques

## 🧪 Tests

Run the test suite with:
```bash
yarn test
```

Test output shows:
- ✅ Entity creation
- ✅ Validation
- ✅ JSON export/import
- ✅ Cloning
- ✅ Resource updates
- ✅ All features working correctly

## 📚 Documentation

- [Integration Docs](/editor/docs.html) - Full integration guide
- [Examples](/editor/examples.html) - Pre-made entity examples
- [Editor](/editor/index.html) - Visual entity editor
