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
  System = 'system',
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

/**
 * Requirement for an edge or feat
 */
export interface EdgeRequirement {
  type: 'attribute' | 'skill' | 'edge' | 'rank' | 'other';
  id?: string;
  min_die?: number;   // For step-die systems (e.g., d8 = 8)
  min_rank?: number;  // For rank-based systems
  description?: string;
}

/**
 * Effect applied by an edge, hindrance, or ability
 */
export interface EdgeEffect {
  type: 'bonus' | 'penalty' | 'replace' | 'special';
  target?: string;
  value?: number | string;
  description?: string;
}

/**
 * A named edge (feat, talent, advantage) in a game system
 */
export interface SystemEdge {
  label: string;
  category?: string;
  requirements?: EdgeRequirement[];
  effects?: EdgeEffect[];
  description?: string;
}

/**
 * A named hindrance (flaw, disadvantage) in a game system
 */
export interface SystemHindrance {
  label: string;
  severity?: 'minor' | 'major' | string;
  effects?: Array<{
    type: string;
    target?: string;
    value?: number | string;
    description?: string;
  }>;
  description?: string;
}

/**
 * Game system definition -- a first-class Tome file that describes the rules
 * of a tabletop RPG system: attributes, skills, edges, hindrances, derived stats,
 * resource pools, and character creation rules.
 *
 * Systems are the "schema" layer; Entities are the "data" layer.
 * An entity references a system via meta.system to declare which rules apply.
 */
export interface GameSystem {
  /** Tome metadata -- format is always 'system' */
  tome: TomeMetadata & { format: 'system' };

  /** System identity */
  meta: {
    id: string;         // e.g., "savage-worlds-swade"
    name: string;       // e.g., "Savage Worlds Adventure Edition"
    publisher?: string;
    version?: string;   // e.g., "swade", "2024"
    engine?: string;    // e.g., "savage-worlds", "year-zero-engine", "d20"
    tags?: string[];
    /** ID of a parent system this one extends (inheritance not yet implemented) */
    parent?: string;
  };

  /** Core mechanical properties of the system */
  mechanics: {
    dice?: number[];      // Valid die sizes, e.g. [4,6,8,10,12] or [6] for YZE
    roll_type?: 'step' | 'pool' | 'single' | 'percentile';
    [key: string]: unknown; // Allow system-specific mechanics (e.g., wild_die, push_rolls)
  };

  /**
   * Attributes (core stats). Supports die-step systems (Savage Worlds)
   * and point-buy systems (Year Zero Engine).
   */
  attributes?: {
    [id: string]: {
      label: string;
      die?: number;         // Default die size (step systems)
      die_steps?: number[]; // Valid die sizes (step systems)
      min?: number;         // Minimum value (point-buy systems)
      max?: number;         // Maximum value
      default?: number;     // Default starting value
    };
  };

  /** Skills, optionally linked to an attribute */
  skills?: {
    [id: string]: {
      label: string;
      attribute?: string; // Linked attribute id
      die?: number;       // Default die size (step systems)
      min?: number;
      max?: number;
    };
  };

  /** Character-level rules: creation budgets and derived stat formulas */
  character?: {
    creation?: {
      attribute_points?: number;
      skill_points?: number;
      starting_advances?: number;
      [key: string]: unknown;
    };
    derived?: {
      [id: string]: {
        label: string;
        formula: string; // e.g., "2 + floor(vigor_die / 2)"
      };
    };
  };

  /** Resource pools (HP, stress, bennies, ammo, etc.) */
  resources?: {
    [id: string]: {
      label: string;
      default?: number | string;
      min?: number;
      max?: number | string;
      formula?: string; // e.g., "strength * 2 + 10"
    };
  };

  /** Edges, feats, talents -- optional advantages characters can acquire */
  edges?: {
    [id: string]: SystemEdge;
  };

  /** Hindrances, flaws, disadvantages */
  hindrances?: {
    [id: string]: SystemHindrance;
  };

  /** Anything system-specific that does not fit the schema above */
  extensions?: Record<string, unknown>;
}
