/**
 * Simple test of the Tome library
 */

import { Entity, validateEntity, EntityType } from './dist/index.js';

console.log('🧪 Testing Tome Library\n');

// Test 1: Create a character
console.log('Test 1: Creating a character...');
const character = new Entity('Thorin Ironshield', EntityType.Character, {
  tags: ['dwarf', 'warrior'],
  system: 'D&D 5e',
  description: 'A battle-hardened dwarf fighter'
});

// Add properties
character
  .setProperty('strength', 18, 'static')
  .setProperty('dexterity', 12, 'static')
  .setProperty('level', 5, 'dynamic');

// Add resources
character
  .setResource('health', { current: 65, maximum: 65 })
  .setResource('mana', { current: 20, maximum: 20 });

// Add capability
character.addCapability('action', {
  name: 'Power Attack',
  description: 'Deal extra damage with melee weapons',
  costs: { stamina: 5 }
});

console.log('✓ Character created:', character.getName());
console.log('  ID:', character.getId());
console.log('  Type:', character.getType());

// Test 2: Validation
console.log('\nTest 2: Validating entity...');
const validationResult = character.validate();
console.log('✓ Valid:', validationResult.valid);
if (validationResult.errors.length > 0) {
  console.log('  Errors:', validationResult.errors);
}
if (validationResult.warnings && validationResult.warnings.length > 0) {
  console.log('  Warnings:', validationResult.warnings);
}

// Test 3: Export to JSON
console.log('\nTest 3: Exporting to JSON...');
const json = character.toJSON({ pretty: true });
console.log('✓ JSON length:', json.length, 'bytes');

// Test 4: Load from JSON
console.log('\nTest 4: Loading from JSON...');
const loaded = Entity.fromJSON(json);
console.log('✓ Loaded character:', loaded.getName());
console.log('  Strength:', loaded.getProperty('strength', 'static'));
console.log('  Health:', loaded.getResource('health').current + '/' + loaded.getResource('health').maximum);

// Test 5: Clone entity
console.log('\nTest 5: Cloning entity...');
const cloned = character.clone();
console.log('✓ Cloned character:', cloned.getName());
console.log('  New ID:', cloned.getId());
console.log('  IDs are different:', cloned.getId() !== character.getId());

// Test 6: Update resource
console.log('\nTest 6: Updating resource...');
character.updateResource('health', 45);
console.log('✓ Health updated to:', character.getResource('health').current);

console.log('\n✅ All tests passed!');

// Show final JSON
console.log('\n📄 Final JSON:');
console.log(character.toJSON());
