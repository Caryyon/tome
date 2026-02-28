/**
 * System class -- represents a game system definition.
 *
 * Systems are the "schema" layer of Tome. They describe the rules of a
 * tabletop RPG system: attributes, skills, traits, derived stats,
 * resource pools, and character creation budgets.
 *
 * Entities are the "data" layer. An entity references a system via meta.system.
 */

import yaml from 'js-yaml';
import { GameSystem, TomeVersion, TomeFormat } from './types';

export class System {
  private data: GameSystem;

  constructor(data: GameSystem) {
    this.data = data;
  }

  /**
   * Creates a System from a YAML string.
   * The YAML should contain everything except the `tome` envelope (added here).
   *
   * @param yamlStr  Raw YAML content of the system file
   * @param id       System id (e.g., "savage-worlds-swade"). Overrides meta.id if present.
   */
  static fromYAML(yamlStr: string, id: string): System {
    const parsed = yaml.load(yamlStr) as Omit<GameSystem, 'tome'>;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`Failed to parse system YAML for id: ${id}`);
    }

    return new System({
      tome: {
        version: TomeVersion.V1_0_0,
        format: TomeFormat.System,
      },
      ...parsed,
      meta: {
        ...parsed.meta,
        id: parsed.meta?.id ?? id,
      },
    });
  }

  /**
   * Creates a System from a JSON string.
   */
  static fromJSON(json: string): System {
    try {
      const data = JSON.parse(json) as GameSystem;
      return new System(data);
    } catch (err) {
      throw new Error(`Failed to parse system JSON: ${err}`);
    }
  }

  /**
   * Creates a System from a plain GameSystem object.
   */
  static fromData(data: GameSystem): System {
    return new System(data);
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  get id(): string {
    return this.data.meta.id;
  }

  get name(): string {
    return this.data.meta.name;
  }

  get engine(): string | undefined {
    return this.data.meta.engine;
  }

  /** Returns the full GameSystem data object. */
  getData(): GameSystem {
    return this.data;
  }

  /** Returns the attribute definition for the given id, or undefined. */
  getAttribute(id: string): GameSystem['attributes'] extends undefined ? never : NonNullable<GameSystem['attributes']>[string] | undefined {
    return this.data.attributes?.[id];
  }

  /** Returns the skill definition for the given id, or undefined. */
  getSkill(id: string): NonNullable<GameSystem['skills']>[string] | undefined {
    return this.data.skills?.[id];
  }

  /** Returns the trait definition for the given id, or undefined. */
  getTrait(id: string): NonNullable<GameSystem['traits']>[string] | undefined {
    return this.data.traits?.[id];
  }

  /**
   * Returns all traits in the system, optionally filtered by polarity.
   * polarity: 'positive' (advantages/feats), 'negative' (flaws/disadvantages), 'neutral'
   */
  getTraits(polarity?: 'positive' | 'negative' | 'neutral'): NonNullable<GameSystem['traits']> {
    const all = this.data.traits ?? {};
    if (!polarity) return all;
    return Object.fromEntries(
      Object.entries(all).filter(([, t]) => t.polarity === polarity)
    );
  }

  /** Returns the valid die sizes for this system (step systems only). */
  getValidDice(): number[] {
    return this.data.mechanics?.dice ?? [];
  }

  /**
   * Returns true if this is a step-die system (e.g., Savage Worlds).
   * In step systems attribute and skill ratings are expressed as a die size.
   */
  isStepSystem(): boolean {
    return this.data.mechanics?.roll_type === 'step';
  }

  /**
   * Returns true if this is a dice-pool system (e.g., Year Zero Engine).
   */
  isPoolSystem(): boolean {
    return this.data.mechanics?.roll_type === 'pool';
  }

  // ---------------------------------------------------------------------------
  // Terminology
  // ---------------------------------------------------------------------------

  /**
   * Returns the system-specific display label for a generic Tome vocabulary key.
   * Falls back to built-in defaults, then to the key itself.
   *
   * Example: swade.getTerm('positive_traits') => 'Edges'
   *          dnd5e.getTerm('positive_traits') => 'Feats'
   */
  getTerm(key: keyof NonNullable<import('./types').GameSystem['terminology']>): string {
    return (this.data.terminology?.[key as string]) ?? this.defaultTerms[key as string] ?? (key as string);
  }

  private defaultTerms: Record<string, string> = {
    attributes: 'Attributes',
    skills: 'Skills',
    traits: 'Traits',
    positive_traits: 'Advantages',
    negative_traits: 'Disadvantages',
    neutral_traits: 'Traits',
    resources: 'Resources',
    character_points: 'XP',
  };

  // ---------------------------------------------------------------------------
  // Serialization
  // ---------------------------------------------------------------------------

  /** Serializes the system to a pretty-printed JSON string. */
  toJSON(): string {
    return JSON.stringify(this.data, null, 2);
  }
}
