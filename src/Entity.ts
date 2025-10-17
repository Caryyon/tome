/**
 * Entity class - Main class for working with Tome entities
 */

import type {
  TomeEntity,
  EntityIdentity,
  EntityProperties,
  EntityCapabilities,
  EntityResources,
  EntityInventory,
  EntityNarrative,
  EntityExtensions,
  ValidationResult,
  ExportOptions,
  Capability,
  InventoryItem,
} from './types';
import { EntityType, TomeVersion, TomeFormat } from './types';
import { validateEntity, generateId, generateTimestamp } from './validation';

export class Entity {
  private data: TomeEntity;

  constructor(
    name: string,
    type: EntityType | string,
    options?: {
      id?: string;
      system?: string;
      description?: string;
      tags?: string[];
    }
  ) {
    const now = generateTimestamp();

    this.data = {
      tome: {
        version: TomeVersion.V1_0_0,
        format: TomeFormat.Entity,
      },
      meta: {
        id: options?.id || generateId(),
        type,
        created: now,
        modified: now,
        tags: options?.tags || [],
        system: options?.system,
      },
      identity: {
        name: {
          primary: name,
        },
        description: options?.description
          ? {
              short: options.description,
            }
          : undefined,
      },
    };
  }

  /**
   * Creates an entity from existing Tome data
   */
  static fromData(data: TomeEntity): Entity {
    const entity = new Entity(data.identity.name.primary, data.meta.type);
    entity.data = { ...data };
    return entity;
  }

  /**
   * Parses a Tome entity from JSON string
   */
  static fromJSON(json: string): Entity {
    try {
      const data = JSON.parse(json) as TomeEntity;
      return Entity.fromData(data);
    } catch (error) {
      throw new Error(`Failed to parse Tome JSON: ${error}`);
    }
  }

  /**
   * Gets the raw entity data
   */
  getData(): TomeEntity {
    return { ...this.data };
  }

  /**
   * Gets the entity ID
   */
  getId(): string {
    return this.data.meta.id;
  }

  /**
   * Gets the entity type
   */
  getType(): string {
    return this.data.meta.type;
  }

  /**
   * Gets the entity name
   */
  getName(): string {
    return this.data.identity.name.primary;
  }

  /**
   * Sets the entity name
   */
  setName(name: string, options?: { alternate?: string[]; pronunciation?: string }): this {
    this.data.identity.name.primary = name;
    if (options?.alternate) {
      this.data.identity.name.alternate = options.alternate;
    }
    if (options?.pronunciation) {
      this.data.identity.name.pronunciation = options.pronunciation;
    }
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets identity classification
   */
  setClassification(classification: Record<string, string | number | boolean>): this {
    this.data.identity.classification = {
      ...this.data.identity.classification,
      ...classification,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets description
   */
  setDescription(description: {
    short?: string;
    full?: string;
    appearance?: string;
    personality?: string;
  }): this {
    this.data.identity.description = {
      ...this.data.identity.description,
      ...description,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets properties
   */
  setProperties(properties: EntityProperties): this {
    this.data.properties = {
      ...this.data.properties,
      ...properties,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets a property by category (alias for backward compatibility with docs)
   */
  setProperty(key: string, value: number | string | boolean, category: 'static' | 'dynamic' | 'computed' = 'dynamic'): this {
    if (!this.data.properties) {
      this.data.properties = {};
    }
    if (!this.data.properties[category]) {
      this.data.properties[category] = {};
    }
    this.data.properties[category][key] = value;
    this.updateModifiedTime();
    return this;
  }

  /**
   * Gets a property value
   */
  getProperty(key: string, category?: 'static' | 'dynamic' | 'computed'): import('./types').PropertyValue | undefined {
    if (!this.data.properties) return undefined;

    if (category) {
      return this.data.properties[category]?.[key];
    }

    // Search all categories
    return this.data.properties.static?.[key]
      ?? this.data.properties.dynamic?.[key]
      ?? this.data.properties.computed?.[key];
  }

  /**
   * Adds a static property
   */
  addStaticProperty(key: string, value: number | string | boolean): this {
    return this.setProperty(key, value, 'static');
  }

  /**
   * Adds a dynamic property
   */
  addDynamicProperty(key: string, value: number | string | boolean): this {
    return this.setProperty(key, value, 'dynamic');
  }

  /**
   * Adds a computed property
   */
  addComputedProperty(key: string, value: number | string | boolean): this {
    return this.setProperty(key, value, 'computed');
  }

  /**
   * Sets capabilities
   */
  setCapabilities(capabilities: EntityCapabilities): this {
    this.data.capabilities = {
      ...this.data.capabilities,
      ...capabilities,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds an action capability
   */
  addAction(action: Capability): this {
    if (!this.data.capabilities) {
      this.data.capabilities = {};
    }
    if (!this.data.capabilities.actions) {
      this.data.capabilities.actions = [];
    }
    this.data.capabilities.actions.push(action);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds a reaction capability
   */
  addReaction(reaction: Capability): this {
    if (!this.data.capabilities) {
      this.data.capabilities = {};
    }
    if (!this.data.capabilities.reactions) {
      this.data.capabilities.reactions = [];
    }
    this.data.capabilities.reactions.push(reaction);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds a passive capability
   */
  addPassive(passive: Capability): this {
    if (!this.data.capabilities) {
      this.data.capabilities = {};
    }
    if (!this.data.capabilities.passive) {
      this.data.capabilities.passive = [];
    }
    this.data.capabilities.passive.push(passive);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Generic method to add a capability by category
   */
  addCapability(category: 'action' | 'reaction' | 'passive', capability: Capability | Omit<Capability, 'id'>): this {
    const fullCapability: Capability = 'id' in capability
      ? capability
      : {
          ...capability,
          id: capability.name.toLowerCase().replace(/\s+/g, '-')
        };

    const categoryMap = {
      action: 'actions',
      reaction: 'reactions',
      passive: 'passive'
    } as const;

    const arrayKey = categoryMap[category];

    if (arrayKey === 'actions') {
      return this.addAction(fullCapability);
    } else if (arrayKey === 'reactions') {
      return this.addReaction(fullCapability);
    } else {
      return this.addPassive(fullCapability);
    }
  }

  /**
   * Sets resources
   */
  setResources(resources: EntityResources): this {
    this.data.resources = {
      ...this.data.resources,
      ...resources,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets a resource (alias for addResource)
   */
  setResource(key: string, resource: EntityResources[string]): this {
    return this.addResource(key, resource);
  }

  /**
   * Adds a resource
   */
  addResource(key: string, resource: EntityResources[string]): this {
    if (!this.data.resources) {
      this.data.resources = {};
    }
    this.data.resources[key] = resource;
    this.updateModifiedTime();
    return this;
  }

  /**
   * Gets a resource by key
   */
  getResource(key: string): EntityResources[string] | undefined {
    return this.data.resources?.[key];
  }

  /**
   * Updates a resource's current value
   */
  updateResource(key: string, current: number | string): this {
    if (this.data.resources?.[key]) {
      this.data.resources[key].current = current;
      this.updateModifiedTime();
    }
    return this;
  }

  /**
   * Sets inventory
   */
  setInventory(inventory: EntityInventory): this {
    this.data.inventory = {
      ...this.data.inventory,
      ...inventory,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds an inventory item
   */
  addInventoryItem(item: InventoryItem): this {
    if (!this.data.inventory) {
      this.data.inventory = {};
    }
    if (!this.data.inventory.items) {
      this.data.inventory.items = [];
    }
    this.data.inventory.items.push(item);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets narrative
   */
  setNarrative(narrative: EntityNarrative): this {
    this.data.narrative = {
      ...this.data.narrative,
      ...narrative,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Sets extensions
   */
  setExtensions(extensions: EntityExtensions): this {
    this.data.extensions = {
      ...this.data.extensions,
      ...extensions,
    };
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds a tag
   */
  addTag(tag: string): this {
    if (!this.data.meta.tags) {
      this.data.meta.tags = [];
    }
    if (!this.data.meta.tags.includes(tag)) {
      this.data.meta.tags.push(tag);
      this.updateModifiedTime();
    }
    return this;
  }

  /**
   * Removes a tag
   */
  removeTag(tag: string): this {
    if (this.data.meta.tags) {
      this.data.meta.tags = this.data.meta.tags.filter((t) => t !== tag);
      this.updateModifiedTime();
    }
    return this;
  }

  /**
   * Validates the entity
   */
  validate(): ValidationResult {
    return validateEntity(this.data);
  }

  /**
   * Exports the entity to JSON string
   */
  toJSON(options: ExportOptions = {}): string {
    const { pretty = true, includeDefaults = false } = options;

    let data = this.data;

    // Remove empty optional fields if not including defaults
    if (!includeDefaults) {
      data = this.removeEmptyFields(data);
    }

    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Clones the entity with a new ID
   */
  clone(): Entity {
    const clonedData = { ...this.data };
    clonedData.meta = {
      ...this.data.meta,
      id: generateId(),
      created: generateTimestamp(),
      modified: generateTimestamp(),
    };
    return Entity.fromData(clonedData);
  }

  /**
   * Updates the modified timestamp
   */
  private updateModifiedTime(): void {
    this.data.meta.modified = generateTimestamp();
  }

  /**
   * Removes empty optional fields
   */
  private removeEmptyFields(obj: TomeEntity): TomeEntity {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.removeEmptyFields(item as TomeEntity)) as unknown as TomeEntity;
    }

    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length === 0) {
            continue;
          }
          if (typeof value === 'object' && Object.keys(value).length === 0) {
            continue;
          }
          result[key] = value;
        }
      }
      return result as unknown as TomeEntity;
    }

    return obj;
  }
}
