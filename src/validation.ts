/**
 * Validation logic for Tome entities
 */

import type {
  TomeEntity,
  TomeContainer,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TomeVersion,
  EntityType,
} from './types';

/**
 * Validates a Tome entity against the schema
 */
export function validateEntity(entity: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!entity || typeof entity !== 'object') {
    return {
      valid: false,
      errors: [{ path: '$', message: 'Entity must be an object' }],
    };
  }

  const e = entity as Partial<TomeEntity>;

  // Validate required tome metadata
  if (!e.tome) {
    errors.push({ path: '$.tome', message: 'Missing required field: tome' });
  } else {
    if (!e.tome.version) {
      errors.push({ path: '$.tome.version', message: 'Missing required field: tome.version' });
    }
    if (!e.tome.format) {
      errors.push({ path: '$.tome.format', message: 'Missing required field: tome.format' });
    } else if (e.tome.format !== 'entity') {
      warnings.push({
        path: '$.tome.format',
        message: `Expected format 'entity', got '${e.tome.format}'`,
      });
    }
  }

  // Validate required meta fields
  if (!e.meta) {
    errors.push({ path: '$.meta', message: 'Missing required field: meta' });
  } else {
    if (!e.meta.id) {
      errors.push({ path: '$.meta.id', message: 'Missing required field: meta.id' });
    }
    if (!e.meta.type) {
      errors.push({ path: '$.meta.type', message: 'Missing required field: meta.type' });
    }

    // Validate ISO-8601 dates if present
    if (e.meta.created && !isValidISO8601(e.meta.created)) {
      warnings.push({
        path: '$.meta.created',
        message: 'Date should be in ISO-8601 format',
      });
    }
    if (e.meta.modified && !isValidISO8601(e.meta.modified)) {
      warnings.push({
        path: '$.meta.modified',
        message: 'Date should be in ISO-8601 format',
      });
    }
  }

  // Validate required identity fields
  if (!e.identity) {
    errors.push({ path: '$.identity', message: 'Missing required field: identity' });
  } else {
    if (!e.identity.name) {
      errors.push({ path: '$.identity.name', message: 'Missing required field: identity.name' });
    } else if (!e.identity.name.primary) {
      errors.push({
        path: '$.identity.name.primary',
        message: 'Missing required field: identity.name.primary',
      });
    }
  }

  // Validate capabilities structure if present
  if (e.capabilities) {
    validateCapabilities(e.capabilities, errors, warnings);
  }

  // Validate resources structure if present
  if (e.resources) {
    validateResources(e.resources, errors, warnings);
  }

  // Validate inventory structure if present
  if (e.inventory) {
    validateInventory(e.inventory, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates a Tome container
 */
export function validateContainer(container: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!container || typeof container !== 'object') {
    return {
      valid: false,
      errors: [{ path: '$', message: 'Container must be an object' }],
    };
  }

  const c = container as Partial<TomeContainer>;

  // Validate tome metadata
  if (!c.tome) {
    errors.push({ path: '$.tome', message: 'Missing required field: tome' });
  } else {
    if (!c.tome.version) {
      errors.push({ path: '$.tome.version', message: 'Missing required field: tome.version' });
    }
    if (c.tome.format !== 'container') {
      errors.push({
        path: '$.tome.format',
        message: `Expected format 'container', got '${c.tome.format}'`,
      });
    }
  }

  // Validate meta
  if (!c.meta) {
    errors.push({ path: '$.meta', message: 'Missing required field: meta' });
  } else {
    if (!c.meta.id) {
      errors.push({ path: '$.meta.id', message: 'Missing required field: meta.id' });
    }
    if (!c.meta.name) {
      errors.push({ path: '$.meta.name', message: 'Missing required field: meta.name' });
    }
  }

  // Validate entities array
  if (!c.entities) {
    errors.push({ path: '$.entities', message: 'Missing required field: entities' });
  } else if (!Array.isArray(c.entities)) {
    errors.push({ path: '$.entities', message: 'Field entities must be an array' });
  } else {
    c.entities.forEach((entity, index) => {
      const entityValidation = validateEntity(entity);
      if (!entityValidation.valid) {
        entityValidation.errors.forEach((err) => {
          errors.push({
            path: `$.entities[${index}]${err.path.substring(1)}`,
            message: err.message,
            code: err.code,
          });
        });
      }
      if (entityValidation.warnings) {
        entityValidation.warnings.forEach((warn) => {
          warnings.push({
            path: `$.entities[${index}]${warn.path.substring(1)}`,
            message: warn.message,
            code: warn.code,
          });
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates capabilities structure
 */
function validateCapabilities(
  capabilities: TomeEntity['capabilities'],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!capabilities) return;

  const validateCapabilityArray = (array: unknown, path: string) => {
    if (!Array.isArray(array)) {
      errors.push({ path, message: 'Capabilities must be an array' });
      return;
    }

    array.forEach((cap, index) => {
      if (!cap.id) {
        errors.push({ path: `${path}[${index}].id`, message: 'Capability missing required id' });
      }
      if (!cap.name) {
        errors.push({
          path: `${path}[${index}].name`,
          message: 'Capability missing required name',
        });
      }
      if (!cap.description) {
        warnings.push({
          path: `${path}[${index}].description`,
          message: 'Capability should have a description',
        });
      }
    });
  };

  if (capabilities.actions) {
    validateCapabilityArray(capabilities.actions, '$.capabilities.actions');
  }
  if (capabilities.reactions) {
    validateCapabilityArray(capabilities.reactions, '$.capabilities.reactions');
  }
  if (capabilities.passive) {
    validateCapabilityArray(capabilities.passive, '$.capabilities.passive');
  }
}

/**
 * Validates resources structure
 */
function validateResources(
  resources: TomeEntity['resources'],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!resources) return;

  Object.entries(resources).forEach(([key, resource]) => {
    const path = `$.resources.${key}`;

    if (resource.current === undefined && resource.current === null) {
      errors.push({ path: `${path}.current`, message: 'Resource missing current value' });
    }

    if (
      resource.maximum !== undefined &&
      resource.current !== undefined &&
      typeof resource.current === 'number' &&
      typeof resource.maximum === 'number' &&
      resource.current > resource.maximum
    ) {
      warnings.push({
        path: `${path}.current`,
        message: 'Current value exceeds maximum',
      });
    }
  });
}

/**
 * Validates inventory structure
 */
function validateInventory(
  inventory: TomeEntity['inventory'],
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!inventory) return;

  if (inventory.items) {
    if (!Array.isArray(inventory.items)) {
      errors.push({ path: '$.inventory.items', message: 'Inventory items must be an array' });
      return;
    }

    inventory.items.forEach((item, index) => {
      const path = `$.inventory.items[${index}]`;
      if (!item.id) {
        errors.push({ path: `${path}.id`, message: 'Inventory item missing required id' });
      }
      if (!item.name) {
        errors.push({ path: `${path}.name`, message: 'Inventory item missing required name' });
      }

      // Recursively validate nested entities
      if (item.entity) {
        const entityValidation = validateEntity(item.entity);
        if (!entityValidation.valid) {
          entityValidation.errors.forEach((err) => {
            errors.push({
              path: `${path}.entity${err.path.substring(1)}`,
              message: err.message,
              code: err.code,
            });
          });
        }
      }
    });
  }
}

/**
 * Helper function to validate ISO-8601 date strings
 */
function isValidISO8601(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Generates a UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates an ISO-8601 timestamp
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// System-aware validation
// ---------------------------------------------------------------------------

// Import lazily to avoid circular dependency issues at module load time.
// The System class imports from types.ts which is fine; this import is
// conditional on whether the caller passes a System instance.
import type { System } from './System';

/**
 * Validates a Tome entity against a loaded game system definition.
 *
 * Checks:
 *  - Properties in properties.static/dynamic are recognized attributes or skills
 *    in the system (warning if unknown).
 *  - For step-die systems, die values must be in the system's valid dice list.
 *  - Passive capabilities referencing edges are noted (no hard failure).
 */
export function validateEntityAgainstSystem(
  entity: TomeEntity,
  system: System,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const systemData = system.getData();
  const validDice = system.getValidDice();
  const isStep = system.isStepSystem();

  // Check that meta.system references the right system id
  if (entity.meta.system && entity.meta.system !== system.id) {
    warnings.push({
      path: '$.meta.system',
      message: `Entity declares system '${entity.meta.system}' but was validated against '${system.id}'`,
    });
  }

  // Validate static properties against known attributes and skills
  const staticProps = entity.properties?.static ?? {};
  for (const [key, value] of Object.entries(staticProps)) {
    const isAttribute = !!systemData.attributes?.[key];
    const isSkill = !!systemData.skills?.[key];

    if (!isAttribute && !isSkill) {
      warnings.push({
        path: `$.properties.static.${key}`,
        message: `Property '${key}' is not a recognized attribute or skill in system '${system.id}'`,
        code: 'UNKNOWN_PROPERTY',
      });
      continue;
    }

    // For step systems, numeric values should be valid die sizes
    if (isStep && validDice.length > 0) {
      const die = typeof value === 'object' && value !== null && 'value' in value
        ? (value as { value: unknown }).value
        : value;
      if (typeof die === 'number' && !validDice.includes(die)) {
        errors.push({
          path: `$.properties.static.${key}`,
          message: `Die value ${die} is not valid for system '${system.id}'. Valid dice: [${validDice.join(', ')}]`,
          code: 'INVALID_DIE',
        });
      }
    }

    // For pool systems, numeric values should be within attribute/skill range
    if (!isStep) {
      const def = isAttribute ? systemData.attributes?.[key] : systemData.skills?.[key];
      const raw = typeof value === 'object' && value !== null && 'value' in value
        ? (value as { value: unknown }).value
        : value;
      if (typeof raw === 'number' && def) {
        if (def.min !== undefined && raw < def.min) {
          errors.push({
            path: `$.properties.static.${key}`,
            message: `Value ${raw} is below minimum ${def.min} for '${key}' in system '${system.id}'`,
            code: 'BELOW_MINIMUM',
          });
        }
        if (def.max !== undefined && raw > def.max) {
          errors.push({
            path: `$.properties.static.${key}`,
            message: `Value ${raw} exceeds maximum ${def.max} for '${key}' in system '${system.id}'`,
            code: 'ABOVE_MAXIMUM',
          });
        }
      }
    }
  }

  // Check passive capabilities that look like edge references
  const passives = entity.capabilities?.passive ?? [];
  for (const passive of passives) {
    if (passive.metadata?.['system_type'] === 'edge' && passive.id) {
      const edgeDef = system.getEdge(passive.id);
      if (!edgeDef) {
        warnings.push({
          path: `$.capabilities.passive[id=${passive.id}]`,
          message: `Edge '${passive.id}' is not defined in system '${system.id}'`,
          code: 'UNKNOWN_EDGE',
        });
      }
    }
    if (passive.metadata?.['system_type'] === 'hindrance' && passive.id) {
      const hindranceDef = system.getHindrance(passive.id);
      if (!hindranceDef) {
        warnings.push({
          path: `$.capabilities.passive[id=${passive.id}]`,
          message: `Hindrance '${passive.id}' is not defined in system '${system.id}'`,
          code: 'UNKNOWN_HINDRANCE',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
