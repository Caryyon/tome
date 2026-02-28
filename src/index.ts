/**
 * Tome - Tabletop Open Markup for Entities
 * Main entry point for the library
 */

// Core classes
export { Entity } from './Entity';
export { Container } from './Container';

// Types
export type {
  TomeEntity,
  TomeContainer,
  TomeMetadata,
  EntityMeta,
  EntityIdentity,
  EntityProperties,
  EntityCapabilities,
  EntityResources,
  EntityInventory,
  EntityNarrative,
  EntityExtensions,
  Capability,
  Resource,
  InventoryItem,
  PropertyValue,
  PropertyObject,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ImportOptions,
  ExportOptions,
} from './types';

export { EntityType, TomeVersion, TomeFormat } from './types';

// Validation
export { validateEntity, validateContainer, generateId, generateTimestamp } from './validation';

// I/O utilities
export {
  loadEntity,
  loadContainer,
  saveEntity,
  saveContainer,
  validateFile,
  detectFileType,
  readFileAsText,
  readFileAsArrayBuffer,
} from './io';

// Re-export MediaFile type from Container
export type { MediaFile } from './Container';

// Version info
export const VERSION = '1.0.0';
export const LIBRARY_NAME = 'Tome';

// System
export { System } from './System';
export type {
  GameSystem,
  SystemTrait,

  TraitRequirement,
  TraitEffect,
} from './types';
