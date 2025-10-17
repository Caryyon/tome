/**
 * Tome Editor - Standalone JavaScript
 */

// Simplified Tome entity creation and validation (standalone version)
class SimpleTomeEntity {
    constructor() {
        this.data = {
            tome: {
                version: '1.0.0',
                format: 'entity',
            },
            meta: {
                id: this.generateId(),
                type: 'character',
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                tags: [],
            },
            identity: {
                name: {
                    primary: '',
                },
            },
        };
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    validate() {
        const errors = [];
        const warnings = [];

        if (!this.data.identity.name.primary) {
            errors.push('Name is required');
        }
        if (!this.data.meta.type) {
            errors.push('Type is required');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    toJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    fromJSON(json) {
        this.data = JSON.parse(json);
    }
}

// Global state
let currentEntity = new SimpleTomeEntity();
let propertyCounter = 0;
let resourceCounter = 0;
let capabilityCounter = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeEventListeners();

    // Check if an example was loaded from the examples page
    const loadedExample = localStorage.getItem('tome-load-example');
    if (loadedExample) {
        try {
            currentEntity.fromJSON(loadedExample);
            loadFormFromEntity();
            localStorage.removeItem('tome-load-example');
        } catch (error) {
            console.error('Failed to load example:', error);
        }
    }

    updatePreview();
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('tome-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initializeEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('tome-theme', newTheme);
        updateThemeButton(newTheme);
    });

    // Toolbar buttons
    document.getElementById('newEntity').addEventListener('click', createNewEntity);
    document.getElementById('loadFile').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    document.getElementById('saveFile').addEventListener('click', saveEntity);
    document.getElementById('validateBtn').addEventListener('click', validateEntity);
    document.getElementById('copyJson').addEventListener('click', copyJson);

    // File input
    document.getElementById('fileInput').addEventListener('change', loadFile);

    // Form fields
    document.getElementById('entityName').addEventListener('input', updateFromForm);
    document.getElementById('entityType').addEventListener('change', updateFromForm);
    document.getElementById('entitySystem').addEventListener('input', updateFromForm);
    document.getElementById('entityTags').addEventListener('input', updateFromForm);
    document.getElementById('descShort').addEventListener('input', updateFromForm);
    document.getElementById('descFull').addEventListener('input', updateFromForm);
    document.getElementById('descAppearance').addEventListener('input', updateFromForm);

    // Add buttons
    document.getElementById('addProperty').addEventListener('click', addProperty);
    document.getElementById('addResource').addEventListener('click', addResource);
    document.getElementById('addCapability').addEventListener('click', addCapability);
}

function createNewEntity() {
    if (confirm('Create a new entity? Current changes will be lost.')) {
        currentEntity = new SimpleTomeEntity();
        propertyCounter = 0;
        resourceCounter = 0;
        capabilityCounter = 0;
        clearForm();
        updatePreview();
    }
}

function clearForm() {
    document.getElementById('entityName').value = '';
    document.getElementById('entityType').value = 'character';
    document.getElementById('entityId').value = currentEntity.data.meta.id;
    document.getElementById('entitySystem').value = '';
    document.getElementById('entityTags').value = '';
    document.getElementById('descShort').value = '';
    document.getElementById('descFull').value = '';
    document.getElementById('descAppearance').value = '';
    document.getElementById('propertyList').innerHTML = '';
    document.getElementById('resourceList').innerHTML = '';
    document.getElementById('capabilityList').innerHTML = '';
    document.getElementById('validationResults').style.display = 'none';
}

function updateFromForm() {
    const name = document.getElementById('entityName').value;
    const type = document.getElementById('entityType').value;
    const system = document.getElementById('entitySystem').value;
    const tags = document.getElementById('entityTags').value
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);
    const descShort = document.getElementById('descShort').value;
    const descFull = document.getElementById('descFull').value;
    const descAppearance = document.getElementById('descAppearance').value;

    currentEntity.data.identity.name.primary = name;
    currentEntity.data.meta.type = type;
    currentEntity.data.meta.system = system || undefined;
    currentEntity.data.meta.tags = tags.length > 0 ? tags : undefined;
    currentEntity.data.meta.modified = new Date().toISOString();

    // Update description
    if (descShort || descFull || descAppearance) {
        currentEntity.data.identity.description = {};
        if (descShort) currentEntity.data.identity.description.short = descShort;
        if (descFull) currentEntity.data.identity.description.full = descFull;
        if (descAppearance) currentEntity.data.identity.description.appearance = descAppearance;
    } else {
        delete currentEntity.data.identity.description;
    }

    document.getElementById('entityId').value = currentEntity.data.meta.id;

    updatePreview();
}

function addProperty() {
    const id = `prop-${propertyCounter++}`;
    const propertyList = document.getElementById('propertyList');

    const item = document.createElement('div');
    item.className = 'property-item';
    item.id = id;
    item.innerHTML = `
        <input type="text" placeholder="Property name" data-field="key">
        <input type="text" placeholder="Value" data-field="value">
        <select data-field="category">
            <option value="static">Static</option>
            <option value="dynamic">Dynamic</option>
            <option value="computed">Computed</option>
        </select>
        <button class="btn-remove" onclick="removeProperty('${id}')">Remove</button>
    `;

    item.querySelectorAll('input, select').forEach((el) => {
        el.addEventListener('input', updateProperties);
        el.addEventListener('change', updateProperties);
    });

    propertyList.appendChild(item);
}

function removeProperty(id) {
    document.getElementById(id).remove();
    updateProperties();
}

function updateProperties() {
    const properties = { static: {}, dynamic: {}, computed: {} };
    const items = document.querySelectorAll('.property-item');

    items.forEach((item) => {
        const key = item.querySelector('[data-field="key"]').value;
        const value = item.querySelector('[data-field="value"]').value;
        const category = item.querySelector('[data-field="category"]').value;

        if (key && value) {
            // Try to parse as number
            const numValue = parseFloat(value);
            properties[category][key] = isNaN(numValue) ? value : numValue;
        }
    });

    if (
        Object.keys(properties.static).length > 0 ||
        Object.keys(properties.dynamic).length > 0 ||
        Object.keys(properties.computed).length > 0
    ) {
        currentEntity.data.properties = {};
        if (Object.keys(properties.static).length > 0) {
            currentEntity.data.properties.static = properties.static;
        }
        if (Object.keys(properties.dynamic).length > 0) {
            currentEntity.data.properties.dynamic = properties.dynamic;
        }
        if (Object.keys(properties.computed).length > 0) {
            currentEntity.data.properties.computed = properties.computed;
        }
    } else {
        delete currentEntity.data.properties;
    }

    currentEntity.data.meta.modified = new Date().toISOString();
    updatePreview();
}

function addResource() {
    const id = `res-${resourceCounter++}`;
    const resourceList = document.getElementById('resourceList');

    const item = document.createElement('div');
    item.className = 'resource-item';
    item.id = id;
    item.innerHTML = `
        <input type="text" placeholder="Resource name (e.g., health)" data-field="key">
        <input type="text" placeholder="Current" data-field="current">
        <input type="text" placeholder="Maximum" data-field="maximum">
        <button class="btn-remove" onclick="removeResource('${id}')">Remove</button>
    `;

    item.querySelectorAll('input').forEach((el) => {
        el.addEventListener('input', updateResources);
    });

    resourceList.appendChild(item);
}

function removeResource(id) {
    document.getElementById(id).remove();
    updateResources();
}

function updateResources() {
    const resources = {};
    const items = document.querySelectorAll('.resource-item');

    items.forEach((item) => {
        const key = item.querySelector('[data-field="key"]').value;
        const current = item.querySelector('[data-field="current"]').value;
        const maximum = item.querySelector('[data-field="maximum"]').value;

        if (key && current) {
            resources[key] = {
                current: isNaN(parseFloat(current)) ? current : parseFloat(current),
            };
            if (maximum) {
                resources[key].maximum = isNaN(parseFloat(maximum)) ? maximum : parseFloat(maximum);
            }
        }
    });

    if (Object.keys(resources).length > 0) {
        currentEntity.data.resources = resources;
    } else {
        delete currentEntity.data.resources;
    }

    currentEntity.data.meta.modified = new Date().toISOString();
    updatePreview();
}

function addCapability() {
    const id = `cap-${capabilityCounter++}`;
    const capabilityList = document.getElementById('capabilityList');

    const item = document.createElement('div');
    item.className = 'capability-item';
    item.id = id;
    item.innerHTML = `
        <input type="text" placeholder="Capability name" data-field="name">
        <select data-field="category">
            <option value="action">Action</option>
            <option value="reaction">Reaction</option>
            <option value="passive">Passive</option>
        </select>
        <input type="text" placeholder="Description" data-field="description">
        <button class="btn-remove" onclick="removeCapability('${id}')">Remove</button>
    `;

    item.querySelectorAll('input, select').forEach((el) => {
        el.addEventListener('input', updateCapabilities);
        el.addEventListener('change', updateCapabilities);
    });

    capabilityList.appendChild(item);
}

function removeCapability(id) {
    document.getElementById(id).remove();
    updateCapabilities();
}

function updateCapabilities() {
    const capabilities = { actions: [], reactions: [], passive: [] };
    const items = document.querySelectorAll('.capability-item');

    items.forEach((item) => {
        const name = item.querySelector('[data-field="name"]').value;
        const category = item.querySelector('[data-field="category"]').value;
        const description = item.querySelector('[data-field="description"]').value;

        if (name) {
            const capability = {
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                description: description || '',
            };

            if (category === 'action') {
                capabilities.actions.push(capability);
            } else if (category === 'reaction') {
                capabilities.reactions.push(capability);
            } else {
                capabilities.passive.push(capability);
            }
        }
    });

    if (
        capabilities.actions.length > 0 ||
        capabilities.reactions.length > 0 ||
        capabilities.passive.length > 0
    ) {
        currentEntity.data.capabilities = {};
        if (capabilities.actions.length > 0) {
            currentEntity.data.capabilities.actions = capabilities.actions;
        }
        if (capabilities.reactions.length > 0) {
            currentEntity.data.capabilities.reactions = capabilities.reactions;
        }
        if (capabilities.passive.length > 0) {
            currentEntity.data.capabilities.passive = capabilities.passive;
        }
    } else {
        delete currentEntity.data.capabilities;
    }

    currentEntity.data.meta.modified = new Date().toISOString();
    updatePreview();
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function updatePreview() {
    const preview = document.getElementById('jsonPreview');
    const json = currentEntity.toJSON();
    preview.innerHTML = syntaxHighlight(json);
}

function validateEntity() {
    const result = currentEntity.validate();
    const resultsDiv = document.getElementById('validationResults');
    const contentDiv = document.getElementById('validationContent');

    resultsDiv.style.display = 'block';
    resultsDiv.className = 'validation-results';

    if (result.valid) {
        resultsDiv.classList.add('validation-success');
        contentDiv.innerHTML = '<p><strong>✅ Valid Tome entity!</strong></p>';
    } else {
        resultsDiv.classList.add('validation-error');
        let html = '<p><strong>Validation failed:</strong></p>';
        html += '<ul class="error-list">';
        result.errors.forEach((error) => {
            html += `<li>${error}</li>`;
        });
        html += '</ul>';
        contentDiv.innerHTML = html;
    }

    if (result.warnings.length > 0) {
        resultsDiv.classList.add('validation-warning');
        let html = contentDiv.innerHTML;
        html += '<p><strong>Warnings:</strong></p>';
        html += '<ul class="warning-list">';
        result.warnings.forEach((warning) => {
            html += `<li>${warning}</li>`;
        });
        html += '</ul>';
        contentDiv.innerHTML = html;
    }
}

function saveEntity() {
    const result = currentEntity.validate();
    if (!result.valid) {
        validateEntity();
        return;
    }

    const json = currentEntity.toJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const name = currentEntity.data.identity.name.primary || 'entity';
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.tome`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            currentEntity.fromJSON(e.target.result);
            loadFormFromEntity();
            updatePreview();
        } catch (error) {
            console.error('Failed to load file:', error);
        }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

function loadFormFromEntity() {
    const data = currentEntity.data;

    document.getElementById('entityName').value = data.identity.name.primary || '';
    document.getElementById('entityType').value = data.meta.type || 'character';
    document.getElementById('entityId').value = data.meta.id || '';
    document.getElementById('entitySystem').value = data.meta.system || '';
    document.getElementById('entityTags').value = (data.meta.tags || []).join(', ');

    if (data.identity.description) {
        document.getElementById('descShort').value = data.identity.description.short || '';
        document.getElementById('descFull').value = data.identity.description.full || '';
        document.getElementById('descAppearance').value = data.identity.description.appearance || '';
    }

    // Clear and rebuild properties
    document.getElementById('propertyList').innerHTML = '';
    propertyCounter = 0;
    if (data.properties) {
        ['static', 'dynamic', 'computed'].forEach((category) => {
            if (data.properties[category]) {
                Object.entries(data.properties[category]).forEach(([key, value]) => {
                    const id = `prop-${propertyCounter++}`;
                    const propertyList = document.getElementById('propertyList');
                    const item = document.createElement('div');
                    item.className = 'property-item';
                    item.id = id;
                    item.innerHTML = `
                        <input type="text" placeholder="Property name" data-field="key" value="${key}">
                        <input type="text" placeholder="Value" data-field="value" value="${value}">
                        <select data-field="category">
                            <option value="static" ${category === 'static' ? 'selected' : ''}>Static</option>
                            <option value="dynamic" ${category === 'dynamic' ? 'selected' : ''}>Dynamic</option>
                            <option value="computed" ${category === 'computed' ? 'selected' : ''}>Computed</option>
                        </select>
                        <button class="btn-remove" onclick="removeProperty('${id}')">Remove</button>
                    `;
                    item.querySelectorAll('input, select').forEach((el) => {
                        el.addEventListener('input', updateProperties);
                        el.addEventListener('change', updateProperties);
                    });
                    propertyList.appendChild(item);
                });
            }
        });
    }

    // Clear and rebuild resources
    document.getElementById('resourceList').innerHTML = '';
    resourceCounter = 0;
    if (data.resources) {
        Object.entries(data.resources).forEach(([key, resource]) => {
            const id = `res-${resourceCounter++}`;
            const resourceList = document.getElementById('resourceList');
            const item = document.createElement('div');
            item.className = 'resource-item';
            item.id = id;
            item.innerHTML = `
                <input type="text" placeholder="Resource name" data-field="key" value="${key}">
                <input type="text" placeholder="Current" data-field="current" value="${resource.current}">
                <input type="text" placeholder="Maximum" data-field="maximum" value="${resource.maximum || ''}">
                <button class="btn-remove" onclick="removeResource('${id}')">Remove</button>
            `;
            item.querySelectorAll('input').forEach((el) => {
                el.addEventListener('input', updateResources);
            });
            resourceList.appendChild(item);
        });
    }

    // Clear and rebuild capabilities
    document.getElementById('capabilityList').innerHTML = '';
    capabilityCounter = 0;
    if (data.capabilities) {
        ['actions', 'reactions', 'passive'].forEach((category) => {
            const catKey = category === 'actions' ? 'action' : category === 'reactions' ? 'reaction' : 'passive';
            if (data.capabilities[category]) {
                data.capabilities[category].forEach((cap) => {
                    const id = `cap-${capabilityCounter++}`;
                    const capabilityList = document.getElementById('capabilityList');
                    const item = document.createElement('div');
                    item.className = 'capability-item';
                    item.id = id;
                    item.innerHTML = `
                        <input type="text" placeholder="Capability name" data-field="name" value="${cap.name}">
                        <select data-field="category">
                            <option value="action" ${catKey === 'action' ? 'selected' : ''}>Action</option>
                            <option value="reaction" ${catKey === 'reaction' ? 'selected' : ''}>Reaction</option>
                            <option value="passive" ${catKey === 'passive' ? 'selected' : ''}>Passive</option>
                        </select>
                        <input type="text" placeholder="Description" data-field="description" value="${cap.description || ''}">
                        <button class="btn-remove" onclick="removeCapability('${id}')">Remove</button>
                    `;
                    item.querySelectorAll('input, select').forEach((el) => {
                        el.addEventListener('input', updateCapabilities);
                        el.addEventListener('change', updateCapabilities);
                    });
                    capabilityList.appendChild(item);
                });
            }
        });
    }
}

function copyJson() {
    const json = currentEntity.toJSON();
    navigator.clipboard.writeText(json).then(() => {
        const btn = document.getElementById('copyJson');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch((error) => {
        console.error('Failed to copy JSON:', error);
    });
}

// Make functions global for onclick handlers
window.removeProperty = removeProperty;
window.removeResource = removeResource;
window.removeCapability = removeCapability;
