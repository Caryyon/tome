/**
 * Example converter: D&D 5e character to Tome format
 * Demonstrates how to convert from a system-specific format to Tome
 */

import { Entity, EntityType } from '../src';

// Example D&D 5e character structure (simplified)
interface DnD5eCharacter {
    name: string;
    race: string;
    class: string;
    level: number;
    background?: string;
    alignment?: string;

    abilities: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
    };

    hitPoints: {
        current: number;
        max: number;
        temp?: number;
    };

    armorClass: number;
    speed: number;
    proficiencyBonus: number;

    skills?: Record<string, number>;
    savingThrows?: Record<string, number>;

    features?: Array<{
        name: string;
        description: string;
        source: string;
    }>;

    spells?: Array<{
        name: string;
        level: number;
        school: string;
        description: string;
    }>;

    spellSlots?: Record<number, { current: number; max: number }>;

    equipment?: Array<{
        name: string;
        quantity: number;
        equipped?: boolean;
    }>;

    backstory?: string;
}

/**
 * Converts a D&D 5e character to Tome format
 */
export function dnd5eToTome(character: DnD5eCharacter): Entity {
    // Create base entity
    const entity = new Entity(character.name, EntityType.Character, {
        system: 'D&D 5e',
        description: `Level ${character.level} ${character.race} ${character.class}`,
        tags: ['dnd5e', character.race.toLowerCase(), character.class.toLowerCase()],
    });

    // Set classification (race, class, level, etc.)
    entity.setClassification({
        race: character.race,
        class: character.class,
        level: character.level,
        background: character.background,
        alignment: character.alignment,
    });

    // Set static properties (abilities)
    entity.addStaticProperty('strength', character.abilities.strength);
    entity.addStaticProperty('dexterity', character.abilities.dexterity);
    entity.addStaticProperty('constitution', character.abilities.constitution);
    entity.addStaticProperty('intelligence', character.abilities.intelligence);
    entity.addStaticProperty('wisdom', character.abilities.wisdom);
    entity.addStaticProperty('charisma', character.abilities.charisma);
    entity.addStaticProperty('armorClass', character.armorClass);
    entity.addStaticProperty('speed', character.speed);
    entity.addStaticProperty('proficiencyBonus', character.proficiencyBonus);

    // Add computed properties (modifiers)
    const getModifier = (score: number) => Math.floor((score - 10) / 2);
    entity.addComputedProperty('strengthModifier', getModifier(character.abilities.strength));
    entity.addComputedProperty('dexterityModifier', getModifier(character.abilities.dexterity));
    entity.addComputedProperty('constitutionModifier', getModifier(character.abilities.constitution));
    entity.addComputedProperty('intelligenceModifier', getModifier(character.abilities.intelligence));
    entity.addComputedProperty('wisdomModifier', getModifier(character.abilities.wisdom));
    entity.addComputedProperty('charismaModifier', getModifier(character.abilities.charisma));

    // Add resources
    entity.addResource('hitPoints', {
        current: character.hitPoints.current,
        maximum: character.hitPoints.max,
        type: 'pool',
    });

    if (character.hitPoints.temp) {
        entity.addResource('temporaryHitPoints', {
            current: character.hitPoints.temp,
            minimum: 0,
            type: 'pool',
        });
    }

    // Add spell slots as resources
    if (character.spellSlots) {
        Object.entries(character.spellSlots).forEach(([level, slots]) => {
            entity.addResource(`spellSlots_level${level}`, {
                current: slots.current,
                maximum: slots.max,
                type: 'pool',
            });
        });
    }

    // Add features as passive capabilities
    if (character.features) {
        character.features.forEach((feature) => {
            entity.addPassive({
                id: feature.name.toLowerCase().replace(/\s+/g, '-'),
                name: feature.name,
                description: feature.description,
                metadata: {
                    source: feature.source,
                },
            });
        });
    }

    // Add spells as action capabilities
    if (character.spells) {
        character.spells.forEach((spell) => {
            entity.addAction({
                id: spell.name.toLowerCase().replace(/\s+/g, '-'),
                name: spell.name,
                description: spell.description,
                type: spell.school,
                costs: spell.level > 0 ? {
                    spellSlot: spell.level,
                } : undefined,
                metadata: {
                    level: spell.level,
                    school: spell.school,
                },
            });
        });
    }

    // Add equipment to inventory
    if (character.equipment) {
        character.equipment.forEach((item) => {
            entity.addInventoryItem({
                id: item.name.toLowerCase().replace(/\s+/g, '-'),
                name: item.name,
                quantity: item.quantity,
                equipped: item.equipped,
            });
        });
    }

    // Add narrative information
    if (character.backstory) {
        entity.setNarrative({
            background: character.backstory,
        });
    }

    // Add D&D 5e specific extensions
    entity.setExtensions({
        'dnd5e': {
            skills: character.skills,
            savingThrows: character.savingThrows,
        },
    });

    return entity;
}

/**
 * Converts Tome format back to D&D 5e (partial reconstruction)
 */
export function tomeToD nd5e(entity: Entity): Partial<DnD5eCharacter> {
    const data = entity.getData();

    const character: Partial<DnD5eCharacter> = {
        name: data.identity.name.primary,
        race: data.identity.classification?.race as string,
        class: data.identity.classification?.class as string,
        level: data.identity.classification?.level as number,
        background: data.identity.classification?.background as string,
        alignment: data.identity.classification?.alignment as string,
    };

    // Reconstruct abilities from static properties
    if (data.properties?.static) {
        character.abilities = {
            strength: data.properties.static.strength as number,
            dexterity: data.properties.static.dexterity as number,
            constitution: data.properties.static.constitution as number,
            intelligence: data.properties.static.intelligence as number,
            wisdom: data.properties.static.wisdom as number,
            charisma: data.properties.static.charisma as number,
        };

        character.armorClass = data.properties.static.armorClass as number;
        character.speed = data.properties.static.speed as number;
        character.proficiencyBonus = data.properties.static.proficiencyBonus as number;
    }

    // Reconstruct hit points from resources
    if (data.resources?.hitPoints) {
        character.hitPoints = {
            current: data.resources.hitPoints.current as number,
            max: data.resources.hitPoints.maximum as number,
            temp: data.resources.temporaryHitPoints?.current as number,
        };
    }

    // Reconstruct features from passive capabilities
    if (data.capabilities?.passive) {
        character.features = data.capabilities.passive.map((cap) => ({
            name: cap.name,
            description: cap.description,
            source: (cap.metadata as any)?.source || 'Unknown',
        }));
    }

    // Reconstruct spells from actions
    if (data.capabilities?.actions) {
        character.spells = data.capabilities.actions
            .filter((cap) => cap.costs?.spellSlot !== undefined)
            .map((cap) => ({
                name: cap.name,
                level: (cap.metadata as any)?.level || 0,
                school: (cap.metadata as any)?.school || cap.type || 'Unknown',
                description: cap.description,
            }));
    }

    // Reconstruct equipment from inventory
    if (data.inventory?.items) {
        character.equipment = data.inventory.items.map((item) => ({
            name: item.name,
            quantity: item.quantity || 1,
            equipped: item.equipped,
        }));
    }

    // Get backstory from narrative
    if (data.narrative?.background) {
        character.backstory = data.narrative.background;
    }

    // Restore D&D 5e extensions
    if (data.extensions?.['dnd5e']) {
        const dndData = data.extensions['dnd5e'] as any;
        character.skills = dndData.skills;
        character.savingThrows = dndData.savingThrows;
    }

    return character;
}
