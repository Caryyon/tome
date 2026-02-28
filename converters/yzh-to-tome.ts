/**
 * Converter: Year Zero Hero (YZH) character JSON -> Tome entity
 *
 * Year Zero Hero exports character data from the Titan Effect Zero game.
 * This converter maps that shape to a Tome entity referencing the
 * 'titan-effect-zero' system.
 *
 * Field mapping:
 *   attributes -> properties.static
 *   skills     -> properties.static
 *   resources  -> resources
 */

import type { TomeEntity, Resource } from '../src/types';
import { EntityType, TomeFormat, TomeVersion } from '../src/types';
import { generateId, generateTimestamp } from '../src/validation';

// ---------------------------------------------------------------------------
// YZH character export shape
// ---------------------------------------------------------------------------

export interface YZHAttribute {
  value: number;
}

export interface YZHSkill {
  value: number;
  attribute: string;
}

export interface YZHResource {
  current: number;
  max?: number;
}

export interface YZHCharacter {
  id?: string;
  name: string;
  role?: string;  // Character class / archetype
  attributes?: Record<string, YZHAttribute>;
  skills?: Record<string, YZHSkill>;
  resources?: Record<string, YZHResource>;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Converter
// ---------------------------------------------------------------------------

/**
 * Converts a YZH character export to a Tome entity.
 * The resulting entity references the 'titan-effect-zero' system via meta.system.
 */
export function yzhToTome(character: YZHCharacter): TomeEntity {
  const now = generateTimestamp();

  // Static properties: attributes and skills as numeric values
  const staticProps: Record<string, number> = {};

  for (const [key, attr] of Object.entries(character.attributes ?? {})) {
    staticProps[key] = attr.value;
  }
  for (const [key, skill] of Object.entries(character.skills ?? {})) {
    staticProps[key] = skill.value;
  }

  // Resources
  const resources: Record<string, Resource> = {};
  for (const [key, res] of Object.entries(character.resources ?? {})) {
    resources[key] = {
      current: res.current,
      ...(res.max !== undefined ? { maximum: res.max } : {}),
      minimum: 0,
      type: 'pool',
    };
  }

  const entity: TomeEntity = {
    tome: {
      version: TomeVersion.V1_0_0,
      format: TomeFormat.Entity,
    },
    meta: {
      id: character.id ?? generateId(),
      type: EntityType.Character,
      system: 'titan-effect-zero',
      created: now,
      modified: now,
      tags: ['titan-effect-zero', 'year-zero-engine', 'player-character'],
    },
    identity: {
      name: { primary: character.name },
      classification: {
        ...(character.role ? { role: character.role } : {}),
      },
    },
    properties: Object.keys(staticProps).length > 0
      ? { static: staticProps }
      : undefined,
    resources: Object.keys(resources).length > 0 ? resources : undefined,
    narrative: character.notes ? { notes: character.notes } : undefined,
  };

  return entity;
}
