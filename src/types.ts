/**
 * Tome - Tabletop Open Markup for Entities
 * Core type definitions for the universal RPG entity format
 */

export enum TomeVersion {
  V1_0_0 = '1.0.0',
}

export enum EntityType {
  Character = 'character',
  Item = 'item',
  Location = 'location',
  Vehicle = 'vehicle',
  NPC = 'npc',
  Creature = 'creature',
  Ability = 'ability',
  Custom = 'custom',
}

export enum TomeFormat {
  Entity = 'entity',
  Container = 'container',
  Exchange = 'exchange',
}

/**
 * Core Tome metadata - present in all Tome files
 */
export interface TomeMetadata {
  version: TomeVersion | string;
  format: TomeFormat | string;
}

/**
 * Entity metadata - required fields
 */
export interface EntityMeta {
  id: string; // UUID or unique identifier
  type: EntityType | string; // Entity type
  created?: string; // ISO-8601 date
  modified?: string; // ISO-8601 date
  tags?: string[]; // Searchable tags
  system?: string; // Optional: RPG system name (e.g., "D&D 5e", "GURPS")
  version?: string; // Optional: Entity version for tracking changes
}

/**
 * Identity information for an entity
 */
export interface EntityIdentity {
  name: {
    primary: string; // Main name
    alternate?: string[]; // Aliases, nicknames
    pronunciation?: string; // How to pronounce
  };
  classification?: {
    [key: string]: string | number | boolean;
    // Examples:
    // race?: string;
    // species?: string;
    // category?: string;
    // level?: number;
    // rank?: string;
  };
  description?: {
    short?: string; // One-line description
    full?: string; // Detailed description
    appearance?: string; // Physical description
    personality?: string; // Character traits
  };
}

/**
 * Property value - can be number, string, or formula
 */
export type PropertyValue = number | string | boolean | PropertyObject;

export interface PropertyObject {
  value: number | string | boolean;
  base?: number | string; // Base value before modifiers
  modifiers?: Array<{
    source: string;
    value: number | string;
    type?: string; // e.g., "bonus", "penalty", "multiplier"
  }>;
  formula?: string; // Calculation formula
  notes?: string;
}

/**
 * Properties section - static, dynamic, and computed values
 */
export interface EntityProperties {
  static?: {
    [key: string]: PropertyValue;
    // Examples:
    // height?: string;
    // weight?: string;
    // size?: string;
    // born?: string;
  };
  dynamic?: {
    [key: string]: PropertyValue;
    // Examples:
    // health?: number;
    // energy?: number;
    // condition?: string;
  };
  computed?: {
    [key: string]: PropertyValue;
    // Examples:
    // totalWeight?: number;
    // carryCapacity?: number;
  };
}

/**
 * Action, reaction, or passive capability
 */
export interface Capability {
  id: string; // Unique identifier
  name: string;
  description: string;
  type?: string; // Category of capability
  requirements?: {
    [key: string]: PropertyValue;
    // Examples:
    // minimumLevel?: number;
    // requiredItem?: string;
  };
  effects?: Array<{
    target: string; // What is affected
    modification: string; // How it's modified
    value?: PropertyValue;
    duration?: string;
  }>;
  costs?: {
    [key: string]: PropertyValue;
    // Examples:
    // energy?: number;
    // ammo?: number;
    // cooldown?: string;
  };
  metadata?: {
    [key: string]: unknown;
    // System-specific data
  };
}

/**
 * Capabilities section - actions, reactions, and passive abilities
 */
export interface EntityCapabilities {
  actions?: Capability[]; // Active abilities
  reactions?: Capability[]; // Triggered responses
  passive?: Capability[]; // Always-on effects
}

/**
 * Resource pool (health, mana, ammo, etc.)
 */
export interface Resource {
  current: number | string;
  maximum?: number | string;
  minimum?: number | string;
  regeneration?: {
    rate: number | string;
    interval?: string; // e.g., "turn", "hour", "rest"
  };
  type?: string; // e.g., "pool", "counter", "gauge"
  notes?: string;
}

/**
 * Resources section - pools, counters, consumables
 */
export interface EntityResources {
  [key: string]: Resource;
  // Examples:
  // health?: Resource;
  // mana?: Resource;
  // stamina?: Resource;
  // ammo?: Resource;
}

/**
 * Inventory item reference
 */
export interface InventoryItem {
  id: string; // Reference to another entity or inline definition
  name: string;
  quantity?: number;
  equipped?: boolean;
  location?: string; // Where it's stored (e.g., "backpack", "left hand")
  notes?: string;
  entity?: TomeEntity; // Full nested entity definition
}

/**
 * Inventory section - contained/owned items
 */
export interface EntityInventory {
  items?: InventoryItem[];
  capacity?: {
    current: number | string;
    maximum: number | string;
    units?: string; // e.g., "kg", "slots", "cubic feet"
  };
  currency?: {
    [key: string]: number;
    // Examples:
    // gold?: number;
    // silver?: number;
    // credits?: number;
  };
}

/**
 * Narrative section - story, background, relationships
 */
export interface EntityNarrative {
  background?: string;
  personality?: string;
  goals?: string[];
  bonds?: Array<{
    entity: string; // ID or name
    relationship: string;
    description?: string;
  }>;
  history?: Array<{
    date?: string;
    event: string;
    notes?: string;
  }>;
  notes?: string;
}

/**
 * Extensions section - system-specific or custom data
 */
export interface EntityExtensions {
  [systemName: string]: unknown;
  // Examples:
  // 'dnd5e'?: { ... };
  // 'pathfinder'?: { ... };
  // 'custom'?: { ... };
}

/**
 * Complete Tome entity structure
 */
export interface TomeEntity {
  tome: TomeMetadata;
  meta: EntityMeta;
  identity: EntityIdentity;
  properties?: EntityProperties;
  capabilities?: EntityCapabilities;
  resources?: EntityResources;
  inventory?: EntityInventory;
  narrative?: EntityNarrative;
  extensions?: EntityExtensions;
}

/**
 * Container format for .tomes files (multiple entities + media)
 */
export interface TomeContainer {
  tome: TomeMetadata & {
    format: 'container';
  };
  meta: {
    id: string;
    name: string;
    description?: string;
    created?: string;
    modified?: string;
    author?: string;
    version?: string;
  };
  entities: TomeEntity[];
  manifest?: {
    media?: Array<{
      id: string;
      filename: string;
      type: string; // MIME type
      purpose?: string; // e.g., "portrait", "map", "token"
      relatedEntity?: string; // Entity ID this media relates to
    }>;
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  path: string; // JSON path to error location
  message: string;
  code?: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code?: string;
}

/**
 * Import/Export options
 */
export interface ImportOptions {
  validate?: boolean; // Validate on import (default: true)
  strict?: boolean; // Strict validation (default: false)
}

export interface ExportOptions {
  pretty?: boolean; // Pretty-print JSON (default: true)
  includeDefaults?: boolean; // Include optional empty fields (default: false)
}
