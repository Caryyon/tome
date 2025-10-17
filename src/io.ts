/**
 * I/O utilities for reading and writing Tome files
 */

import { Entity } from './Entity';
import { Container } from './Container';
import type { ImportOptions, TomeEntity, TomeContainer } from './types';
import { validateEntity, validateContainer } from './validation';

/**
 * Loads an entity from a .tome file (JSON)
 */
export async function loadEntity(
  file: File | Blob,
  options: ImportOptions = {}
): Promise<Entity> {
  const { validate = true, strict = false } = options;

  const text = await file.text();
  const data = JSON.parse(text) as TomeEntity;

  if (validate) {
    const result = validateEntity(data);
    if (!result.valid) {
      const errorMessages = result.errors.map((e) => `${e.path}: ${e.message}`).join('\n');
      throw new Error(`Invalid Tome entity:\n${errorMessages}`);
    }
    if (strict && result.warnings && result.warnings.length > 0) {
      const warningMessages = result.warnings.map((w) => `${w.path}: ${w.message}`).join('\n');
      throw new Error(`Tome entity has warnings:\n${warningMessages}`);
    }
  }

  return Entity.fromData(data);
}

/**
 * Loads a container from a .tomes file (ZIP)
 */
export async function loadContainer(
  file: File | Blob,
  options: ImportOptions = {}
): Promise<Container> {
  const { validate = true, strict = false } = options;

  const arrayBuffer = await file.arrayBuffer();
  const container = await Container.fromZip(arrayBuffer);

  if (validate) {
    const result = validateContainer(container.getData());
    if (!result.valid) {
      const errorMessages = result.errors.map((e) => `${e.path}: ${e.message}`).join('\n');
      throw new Error(`Invalid Tome container:\n${errorMessages}`);
    }
    if (strict && result.warnings && result.warnings.length > 0) {
      const warningMessages = result.warnings.map((w) => `${w.path}: ${w.message}`).join('\n');
      throw new Error(`Tome container has warnings:\n${warningMessages}`);
    }
  }

  return container;
}

/**
 * Saves an entity to a .tome file (JSON)
 */
export function saveEntity(entity: Entity, filename?: string): void {
  const json = entity.toJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const name = filename || `${entity.getName()}.tome`;
  downloadBlob(blob, name);
}

/**
 * Saves a container to a .tomes file (ZIP)
 */
export async function saveContainer(container: Container, filename?: string): Promise<void> {
  const blob = await container.toZip();
  const name = filename || `${container.getName()}.tomes`;
  downloadBlob(blob, name);
}

/**
 * Helper function to download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads a file as text (browser or Node.js)
 */
export async function readFileAsText(file: File | Blob): Promise<string> {
  return await file.text();
}

/**
 * Reads a file as ArrayBuffer (browser or Node.js)
 */
export async function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

/**
 * Detects the Tome file type from extension
 */
export function detectFileType(filename: string): 'entity' | 'container' | 'exchange' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'tome':
      return 'entity';
    case 'tomes':
      return 'container';
    case 'tomex':
      return 'exchange';
    default:
      return 'unknown';
  }
}

/**
 * Validates a Tome file and returns the result
 */
export async function validateFile(
  file: File | Blob,
  fileType?: 'entity' | 'container'
): Promise<{
  valid: boolean;
  type: 'entity' | 'container' | 'unknown';
  errors: string[];
  warnings: string[];
}> {
  try {
    // Try to detect type if not provided
    let type = fileType;
    if (!type && file instanceof File) {
      const detectedType = detectFileType(file.name);
      if (detectedType === 'entity' || detectedType === 'container') {
        type = detectedType;
      }
    }

    // Try entity format
    if (type === 'entity' || !type) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const result = validateEntity(data);
        if (result.valid || type === 'entity') {
          return {
            valid: result.valid,
            type: 'entity',
            errors: result.errors.map((e) => `${e.path}: ${e.message}`),
            warnings: result.warnings?.map((w) => `${w.path}: ${w.message}`) || [],
          };
        }
      } catch (e) {
        // Not a valid entity, try container
      }
    }

    // Try container format
    if (type === 'container' || !type) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const container = await Container.fromZip(arrayBuffer);
        const result = validateContainer(container.getData());
        return {
          valid: result.valid,
          type: 'container',
          errors: result.errors.map((e) => `${e.path}: ${e.message}`),
          warnings: result.warnings?.map((w) => `${w.path}: ${w.message}`) || [],
        };
      } catch (e) {
        // Not a valid container
      }
    }

    return {
      valid: false,
      type: 'unknown',
      errors: ['Unable to determine file type or parse file'],
      warnings: [],
    };
  } catch (error) {
    return {
      valid: false,
      type: 'unknown',
      errors: [`Failed to validate file: ${error}`],
      warnings: [],
    };
  }
}
