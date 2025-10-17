/**
 * Example converter: Tome to generic display format
 * Demonstrates how to render a Tome entity in various formats
 */

import type { TomeEntity, Capability } from '../src';

/**
 * Converts a Tome entity to a formatted text display
 */
export function tomeToText(entity: TomeEntity): string {
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(60));
    lines.push(`${entity.identity.name.primary}`);
    if (entity.meta.system) {
        lines.push(`System: ${entity.meta.system}`);
    }
    lines.push(`Type: ${entity.meta.type}`);
    lines.push('='.repeat(60));
    lines.push('');

    // Classification
    if (entity.identity.classification) {
        lines.push('Classification:');
        Object.entries(entity.identity.classification).forEach(([key, value]) => {
            lines.push(`  ${capitalize(key)}: ${value}`);
        });
        lines.push('');
    }

    // Description
    if (entity.identity.description) {
        lines.push('Description:');
        if (entity.identity.description.short) {
            lines.push(`  ${entity.identity.description.short}`);
        }
        if (entity.identity.description.full) {
            lines.push(`  ${entity.identity.description.full}`);
        }
        if (entity.identity.description.appearance) {
            lines.push(`  Appearance: ${entity.identity.description.appearance}`);
        }
        lines.push('');
    }

    // Properties
    if (entity.properties) {
        lines.push('Properties:');

        if (entity.properties.static) {
            lines.push('  Static:');
            Object.entries(entity.properties.static).forEach(([key, value]) => {
                lines.push(`    ${capitalize(key)}: ${formatValue(value)}`);
            });
        }

        if (entity.properties.dynamic) {
            lines.push('  Dynamic:');
            Object.entries(entity.properties.dynamic).forEach(([key, value]) => {
                lines.push(`    ${capitalize(key)}: ${formatValue(value)}`);
            });
        }

        if (entity.properties.computed) {
            lines.push('  Computed:');
            Object.entries(entity.properties.computed).forEach(([key, value]) => {
                lines.push(`    ${capitalize(key)}: ${formatValue(value)}`);
            });
        }

        lines.push('');
    }

    // Resources
    if (entity.resources) {
        lines.push('Resources:');
        Object.entries(entity.resources).forEach(([key, resource]) => {
            const current = resource.current;
            const max = resource.maximum;
            const display = max ? `${current}/${max}` : current;
            lines.push(`  ${capitalize(key)}: ${display}`);
        });
        lines.push('');
    }

    // Capabilities
    if (entity.capabilities) {
        if (entity.capabilities.actions && entity.capabilities.actions.length > 0) {
            lines.push('Actions:');
            entity.capabilities.actions.forEach((cap) => {
                lines.push(`  • ${formatCapability(cap)}`);
            });
            lines.push('');
        }

        if (entity.capabilities.reactions && entity.capabilities.reactions.length > 0) {
            lines.push('Reactions:');
            entity.capabilities.reactions.forEach((cap) => {
                lines.push(`  • ${formatCapability(cap)}`);
            });
            lines.push('');
        }

        if (entity.capabilities.passive && entity.capabilities.passive.length > 0) {
            lines.push('Passive Abilities:');
            entity.capabilities.passive.forEach((cap) => {
                lines.push(`  • ${formatCapability(cap)}`);
            });
            lines.push('');
        }
    }

    // Inventory
    if (entity.inventory?.items && entity.inventory.items.length > 0) {
        lines.push('Inventory:');
        entity.inventory.items.forEach((item) => {
            const qty = item.quantity && item.quantity > 1 ? ` (x${item.quantity})` : '';
            const equipped = item.equipped ? ' [EQUIPPED]' : '';
            lines.push(`  • ${item.name}${qty}${equipped}`);
        });
        lines.push('');
    }

    // Narrative
    if (entity.narrative) {
        if (entity.narrative.background) {
            lines.push('Background:');
            lines.push(`  ${entity.narrative.background}`);
            lines.push('');
        }

        if (entity.narrative.personality) {
            lines.push('Personality:');
            lines.push(`  ${entity.narrative.personality}`);
            lines.push('');
        }
    }

    // Metadata
    lines.push('---');
    lines.push(`ID: ${entity.meta.id}`);
    if (entity.meta.tags && entity.meta.tags.length > 0) {
        lines.push(`Tags: ${entity.meta.tags.join(', ')}`);
    }
    if (entity.meta.created) {
        lines.push(`Created: ${new Date(entity.meta.created).toLocaleDateString()}`);
    }
    if (entity.meta.modified) {
        lines.push(`Modified: ${new Date(entity.meta.modified).toLocaleDateString()}`);
    }

    return lines.join('\n');
}

/**
 * Converts a Tome entity to an HTML display
 */
export function tomeToHTML(entity: TomeEntity): string {
    const parts: string[] = [];

    parts.push('<div class="tome-entity">');

    // Header
    parts.push(`<h1 class="entity-name">${escape(entity.identity.name.primary)}</h1>`);
    if (entity.meta.system) {
        parts.push(`<p class="entity-system">System: ${escape(entity.meta.system)}</p>`);
    }
    parts.push(`<p class="entity-type">Type: ${escape(entity.meta.type)}</p>`);

    // Classification
    if (entity.identity.classification) {
        parts.push('<div class="entity-classification">');
        parts.push('<h3>Classification</h3>');
        parts.push('<dl>');
        Object.entries(entity.identity.classification).forEach(([key, value]) => {
            parts.push(`<dt>${escape(capitalize(key))}</dt>`);
            parts.push(`<dd>${escape(String(value))}</dd>`);
        });
        parts.push('</dl>');
        parts.push('</div>');
    }

    // Description
    if (entity.identity.description) {
        parts.push('<div class="entity-description">');
        parts.push('<h3>Description</h3>');
        if (entity.identity.description.short) {
            parts.push(`<p class="desc-short">${escape(entity.identity.description.short)}</p>`);
        }
        if (entity.identity.description.full) {
            parts.push(`<p class="desc-full">${escape(entity.identity.description.full)}</p>`);
        }
        parts.push('</div>');
    }

    // Properties
    if (entity.properties) {
        parts.push('<div class="entity-properties">');
        parts.push('<h3>Properties</h3>');

        ['static', 'dynamic', 'computed'].forEach((category) => {
            const props = entity.properties?.[category as keyof typeof entity.properties];
            if (props && Object.keys(props).length > 0) {
                parts.push(`<h4>${capitalize(category)}</h4>`);
                parts.push('<dl>');
                Object.entries(props).forEach(([key, value]) => {
                    parts.push(`<dt>${escape(capitalize(key))}</dt>`);
                    parts.push(`<dd>${escape(formatValue(value))}</dd>`);
                });
                parts.push('</dl>');
            }
        });

        parts.push('</div>');
    }

    // Resources
    if (entity.resources) {
        parts.push('<div class="entity-resources">');
        parts.push('<h3>Resources</h3>');
        parts.push('<table>');
        parts.push('<tr><th>Resource</th><th>Current</th><th>Maximum</th></tr>');
        Object.entries(entity.resources).forEach(([key, resource]) => {
            parts.push('<tr>');
            parts.push(`<td>${escape(capitalize(key))}</td>`);
            parts.push(`<td>${resource.current}</td>`);
            parts.push(`<td>${resource.maximum || '—'}</td>`);
            parts.push('</tr>');
        });
        parts.push('</table>');
        parts.push('</div>');
    }

    // Capabilities
    if (entity.capabilities) {
        parts.push('<div class="entity-capabilities">');
        parts.push('<h3>Capabilities</h3>');

        if (entity.capabilities.actions && entity.capabilities.actions.length > 0) {
            parts.push('<h4>Actions</h4>');
            parts.push('<ul>');
            entity.capabilities.actions.forEach((cap) => {
                parts.push(`<li>${formatCapabilityHTML(cap)}</li>`);
            });
            parts.push('</ul>');
        }

        if (entity.capabilities.reactions && entity.capabilities.reactions.length > 0) {
            parts.push('<h4>Reactions</h4>');
            parts.push('<ul>');
            entity.capabilities.reactions.forEach((cap) => {
                parts.push(`<li>${formatCapabilityHTML(cap)}</li>`);
            });
            parts.push('</ul>');
        }

        if (entity.capabilities.passive && entity.capabilities.passive.length > 0) {
            parts.push('<h4>Passive Abilities</h4>');
            parts.push('<ul>');
            entity.capabilities.passive.forEach((cap) => {
                parts.push(`<li>${formatCapabilityHTML(cap)}</li>`);
            });
            parts.push('</ul>');
        }

        parts.push('</div>');
    }

    // Inventory
    if (entity.inventory?.items && entity.inventory.items.length > 0) {
        parts.push('<div class="entity-inventory">');
        parts.push('<h3>Inventory</h3>');
        parts.push('<ul>');
        entity.inventory.items.forEach((item) => {
            const qty = item.quantity && item.quantity > 1 ? ` (×${item.quantity})` : '';
            const equipped = item.equipped ? ' <span class="equipped">[EQUIPPED]</span>' : '';
            parts.push(`<li>${escape(item.name)}${qty}${equipped}</li>`);
        });
        parts.push('</ul>');
        parts.push('</div>');
    }

    parts.push('</div>');

    return parts.join('\n');
}

/**
 * Converts a Tome entity to a Markdown display
 */
export function tomeToMarkdown(entity: TomeEntity): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${entity.identity.name.primary}`);
    lines.push('');
    if (entity.meta.system) {
        lines.push(`**System:** ${entity.meta.system}  `);
    }
    lines.push(`**Type:** ${entity.meta.type}  `);
    lines.push('');

    // Classification
    if (entity.identity.classification) {
        lines.push('## Classification');
        lines.push('');
        Object.entries(entity.identity.classification).forEach(([key, value]) => {
            lines.push(`- **${capitalize(key)}:** ${value}`);
        });
        lines.push('');
    }

    // Description
    if (entity.identity.description) {
        lines.push('## Description');
        lines.push('');
        if (entity.identity.description.short) {
            lines.push(`> ${entity.identity.description.short}`);
            lines.push('');
        }
        if (entity.identity.description.full) {
            lines.push(entity.identity.description.full);
            lines.push('');
        }
    }

    // Properties
    if (entity.properties) {
        lines.push('## Properties');
        lines.push('');

        ['static', 'dynamic', 'computed'].forEach((category) => {
            const props = entity.properties?.[category as keyof typeof entity.properties];
            if (props && Object.keys(props).length > 0) {
                lines.push(`### ${capitalize(category)}`);
                lines.push('');
                Object.entries(props).forEach(([key, value]) => {
                    lines.push(`- **${capitalize(key)}:** ${formatValue(value)}`);
                });
                lines.push('');
            }
        });
    }

    // Resources
    if (entity.resources) {
        lines.push('## Resources');
        lines.push('');
        lines.push('| Resource | Current | Maximum |');
        lines.push('|----------|---------|---------|');
        Object.entries(entity.resources).forEach(([key, resource]) => {
            lines.push(`| ${capitalize(key)} | ${resource.current} | ${resource.maximum || '—'} |`);
        });
        lines.push('');
    }

    // Capabilities
    if (entity.capabilities) {
        lines.push('## Capabilities');
        lines.push('');

        if (entity.capabilities.actions && entity.capabilities.actions.length > 0) {
            lines.push('### Actions');
            lines.push('');
            entity.capabilities.actions.forEach((cap) => {
                lines.push(`- **${cap.name}**: ${cap.description}`);
            });
            lines.push('');
        }

        if (entity.capabilities.reactions && entity.capabilities.reactions.length > 0) {
            lines.push('### Reactions');
            lines.push('');
            entity.capabilities.reactions.forEach((cap) => {
                lines.push(`- **${cap.name}**: ${cap.description}`);
            });
            lines.push('');
        }

        if (entity.capabilities.passive && entity.capabilities.passive.length > 0) {
            lines.push('### Passive Abilities');
            lines.push('');
            entity.capabilities.passive.forEach((cap) => {
                lines.push(`- **${cap.name}**: ${cap.description}`);
            });
            lines.push('');
        }
    }

    // Inventory
    if (entity.inventory?.items && entity.inventory.items.length > 0) {
        lines.push('## Inventory');
        lines.push('');
        entity.inventory.items.forEach((item) => {
            const qty = item.quantity && item.quantity > 1 ? ` (×${item.quantity})` : '';
            const equipped = item.equipped ? ' ✓' : '';
            lines.push(`- ${item.name}${qty}${equipped}`);
        });
        lines.push('');
    }

    return lines.join('\n');
}

// Helper functions

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return String(value);
}

function formatCapability(cap: Capability): string {
    let result = `${cap.name}: ${cap.description}`;
    if (cap.costs && Object.keys(cap.costs).length > 0) {
        const costs = Object.entries(cap.costs)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        result += ` (Cost: ${costs})`;
    }
    return result;
}

function formatCapabilityHTML(cap: Capability): string {
    let result = `<strong>${escape(cap.name)}</strong>: ${escape(cap.description)}`;
    if (cap.costs && Object.keys(cap.costs).length > 0) {
        const costs = Object.entries(cap.costs)
            .map(([k, v]) => `${escape(k)}: ${escape(String(v))}`)
            .join(', ');
        result += ` <span class="cost">(Cost: ${costs})</span>`;
    }
    return result;
}

function escape(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
