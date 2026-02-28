/**
 * Converter: savaged-core PlayerCharacter -> Tome entity
 *
 * savaged-core (https://github.com/savage-worlds/savaged-core) exports
 * character data in a PlayerCharacter shape. This converter maps that
 * shape to a Tome entity referencing the 'savage-worlds-swade' system.
 *
 * Field mapping:
 *   traits (attributes)  -> properties.static  (die value as number)
 *   skills               -> properties.static  (die value as number)
 *   edges                -> capabilities.passive (metadata.system_type = 'trait', polarity = 'positive')
 *   hindrances           -> capabilities.passive (metadata.system_type = 'trait', polarity = 'negative')
 *   derived stats        -> properties.computed
 *   wounds / bennies     -> resources
 */

import type { TomeEntity, Capability, Resource } from '../src/types';
import { EntityType, TomeFormat, TomeVersion } from '../src/types';
import { generateId, generateTimestamp } from '../src/validation';

// ---------------------------------------------------------------------------
// savaged-core shape (minimal -- cover what we need to map)
// ---------------------------------------------------------------------------

export interface SavedTrait {
  name: string;
  die: number;       // e.g., 6 for d6, 8 for d8
  modifier?: number;
}

export interface SavedSkill {
  name: string;
  attribute: string;
  die: number;
}

export interface SavedEdge {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface SavedHindrance {
  id: string;
  name: string;
  description?: string;
  severity?: 'minor' | 'major';
}

export interface SavedPlayerCharacter {
  id?: string;
  name: string;
  race?: string;
  rank?: string;
  advances?: number;
  traits?: SavedTrait[];
  skills?: SavedSkill[];
  edges?: SavedEdge[];
  hindrances?: SavedHindrance[];
  // Derived stats produced by savaged-core
  derived?: {
    pace?: number;
    parry?: number;
    toughness?: number;
  };
  // Current resource values
  wounds?: number;
  bennies?: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Converter
// ---------------------------------------------------------------------------

/**
 * Converts a savaged-core PlayerCharacter export to a Tome entity.
 * The resulting entity references the 'savage-worlds-swade' system via meta.system.
 */
export function savegedToTome(pc: SavedPlayerCharacter): TomeEntity {
  const now = generateTimestamp();

  // Static properties: attributes and skills as die values
  const staticProps: Record<string, number> = {};

  for (const trait of pc.traits ?? []) {
    const key = trait.name.toLowerCase().replace(/\s+/g, '_');
    staticProps[key] = trait.die;
  }
  for (const skill of pc.skills ?? []) {
    const key = skill.name.toLowerCase().replace(/\s+/g, '_');
    staticProps[key] = skill.die;
  }

  // Computed properties: derived stats
  const computedProps: Record<string, number> = {};
  if (pc.derived?.pace !== undefined) computedProps['pace'] = pc.derived.pace;
  if (pc.derived?.parry !== undefined) computedProps['parry'] = pc.derived.parry;
  if (pc.derived?.toughness !== undefined) computedProps['toughness'] = pc.derived.toughness;

  // Passive capabilities: traits (edges)
  const passives: Capability[] = [];

  for (const edge of pc.edges ?? []) {
    passives.push({
      id: edge.id,
      name: edge.name,
      description: edge.description ?? '',
      type: 'trait',
      metadata: {
        system_type: 'trait',
        polarity: 'positive',
        category: edge.category,
      },
    });
  }

  // Passive capabilities: traits (hindrances)
  for (const hindrance of pc.hindrances ?? []) {
    passives.push({
      id: hindrance.id,
      name: hindrance.name,
      description: hindrance.description ?? '',
      type: 'trait',
      metadata: {
        system_type: 'trait',
        polarity: 'negative',
        severity: hindrance.severity,
      },
    });
  }

  // Resources
  const resources: Record<string, Resource> = {
    wounds: {
      current: pc.wounds ?? 0,
      minimum: 0,
      maximum: 3,
      type: 'counter',
    },
    bennies: {
      current: pc.bennies ?? 3,
      minimum: 0,
      type: 'pool',
    },
  };

  const entity: TomeEntity = {
    tome: {
      version: TomeVersion.V1_0_0,
      format: TomeFormat.Entity,
    },
    meta: {
      id: pc.id ?? generateId(),
      type: EntityType.Character,
      system: 'savage-worlds-swade',
      created: now,
      modified: now,
      tags: ['savage-worlds', 'swade', 'player-character'],
    },
    identity: {
      name: { primary: pc.name },
      classification: {
        ...(pc.race ? { race: pc.race } : {}),
        ...(pc.rank ? { rank: pc.rank } : {}),
        ...(pc.advances !== undefined ? { advances: pc.advances } : {}),
      },
    },
    properties: {
      static: staticProps,
      ...(Object.keys(computedProps).length > 0 ? { computed: computedProps } : {}),
    },
    capabilities: passives.length > 0 ? { passive: passives } : undefined,
    resources,
    narrative: pc.notes ? { notes: pc.notes } : undefined,
  };

  return entity;
}
