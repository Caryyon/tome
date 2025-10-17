/**
 * Container class - Handles .tomes files (ZIP format with multiple entities + media)
 */

import JSZip from 'jszip';
import type {
  TomeContainer,
  TomeEntity,
  ValidationResult,
  ExportOptions,
} from './types';
import { TomeVersion, TomeFormat } from './types';
import { validateContainer, generateId, generateTimestamp } from './validation';
import { Entity } from './Entity';

export interface MediaFile {
  id: string;
  filename: string;
  type: string; // MIME type
  data: Blob | ArrayBuffer;
  purpose?: string;
  relatedEntity?: string;
}

export class Container {
  private data: TomeContainer;
  private mediaFiles: Map<string, MediaFile>;

  constructor(name: string, options?: { id?: string; description?: string; author?: string }) {
    const now = generateTimestamp();

    this.data = {
      tome: {
        version: TomeVersion.V1_0_0,
        format: TomeFormat.Container,
      },
      meta: {
        id: options?.id || generateId(),
        name,
        description: options?.description,
        created: now,
        modified: now,
        author: options?.author,
      },
      entities: [],
    };

    this.mediaFiles = new Map();
  }

  /**
   * Creates a container from existing data
   */
  static fromData(data: TomeContainer, mediaFiles?: MediaFile[]): Container {
    const container = new Container(data.meta.name);
    container.data = { ...data };

    if (mediaFiles) {
      mediaFiles.forEach((media) => {
        container.mediaFiles.set(media.id, media);
      });
    }

    return container;
  }

  /**
   * Loads a container from a .tomes file (ZIP)
   */
  static async fromZip(arrayBuffer: ArrayBuffer): Promise<Container> {
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Load manifest
    const manifestFile = zip.file('manifest.json');
    if (!manifestFile) {
      throw new Error('Invalid .tomes file: missing manifest.json');
    }

    const manifestText = await manifestFile.async('text');
    const containerData = JSON.parse(manifestText) as TomeContainer;

    // Load entities
    const entitiesFolder = zip.folder('entities');
    if (!entitiesFolder) {
      throw new Error('Invalid .tomes file: missing entities folder');
    }

    const entities: TomeEntity[] = [];
    const entityFiles = Object.keys(zip.files).filter((path) => path.startsWith('entities/'));

    for (const path of entityFiles) {
      if (path.endsWith('.json')) {
        const file = zip.file(path);
        if (file) {
          const entityText = await file.async('text');
          const entity = JSON.parse(entityText) as TomeEntity;
          entities.push(entity);
        }
      }
    }

    containerData.entities = entities;

    // Load media files
    const mediaFiles: MediaFile[] = [];
    const mediaFolder = zip.folder('media');

    if (mediaFolder && containerData.manifest?.media) {
      for (const mediaInfo of containerData.manifest.media) {
        const file = zip.file(`media/${mediaInfo.filename}`);
        if (file) {
          const data = await file.async('arraybuffer');
          mediaFiles.push({
            id: mediaInfo.id,
            filename: mediaInfo.filename,
            type: mediaInfo.type,
            data,
            purpose: mediaInfo.purpose,
            relatedEntity: mediaInfo.relatedEntity,
          });
        }
      }
    }

    return Container.fromData(containerData, mediaFiles);
  }

  /**
   * Gets the raw container data
   */
  getData(): TomeContainer {
    return { ...this.data };
  }

  /**
   * Gets the container ID
   */
  getId(): string {
    return this.data.meta.id;
  }

  /**
   * Gets the container name
   */
  getName(): string {
    return this.data.meta.name;
  }

  /**
   * Sets the container name
   */
  setName(name: string): this {
    this.data.meta.name = name;
    this.updateModifiedTime();
    return this;
  }

  /**
   * Adds an entity to the container
   */
  addEntity(entity: Entity | TomeEntity): this {
    const entityData = entity instanceof Entity ? entity.getData() : entity;
    this.data.entities.push(entityData);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Removes an entity by ID
   */
  removeEntity(entityId: string): this {
    this.data.entities = this.data.entities.filter((e) => e.meta.id !== entityId);
    this.updateModifiedTime();
    return this;
  }

  /**
   * Gets all entities
   */
  getEntities(): TomeEntity[] {
    return [...this.data.entities];
  }

  /**
   * Gets an entity by ID
   */
  getEntity(entityId: string): TomeEntity | undefined {
    return this.data.entities.find((e) => e.meta.id === entityId);
  }

  /**
   * Adds a media file to the container
   */
  addMedia(media: MediaFile): this {
    this.mediaFiles.set(media.id, media);

    // Update manifest
    if (!this.data.manifest) {
      this.data.manifest = {};
    }
    if (!this.data.manifest.media) {
      this.data.manifest.media = [];
    }

    // Remove existing entry if it exists
    this.data.manifest.media = this.data.manifest.media.filter((m) => m.id !== media.id);

    // Add new entry
    this.data.manifest.media.push({
      id: media.id,
      filename: media.filename,
      type: media.type,
      purpose: media.purpose,
      relatedEntity: media.relatedEntity,
    });

    this.updateModifiedTime();
    return this;
  }

  /**
   * Removes a media file by ID
   */
  removeMedia(mediaId: string): this {
    this.mediaFiles.delete(mediaId);

    if (this.data.manifest?.media) {
      this.data.manifest.media = this.data.manifest.media.filter((m) => m.id !== mediaId);
    }

    this.updateModifiedTime();
    return this;
  }

  /**
   * Gets all media files
   */
  getMediaFiles(): MediaFile[] {
    return Array.from(this.mediaFiles.values());
  }

  /**
   * Gets a media file by ID
   */
  getMedia(mediaId: string): MediaFile | undefined {
    return this.mediaFiles.get(mediaId);
  }

  /**
   * Validates the container
   */
  validate(): ValidationResult {
    return validateContainer(this.data);
  }

  /**
   * Exports the container to a .tomes file (ZIP)
   */
  async toZip(): Promise<Blob> {
    const zip = new JSZip();

    // Add manifest
    const manifestJson = JSON.stringify(this.data, null, 2);
    zip.file('manifest.json', manifestJson);

    // Add entities
    const entitiesFolder = zip.folder('entities');
    if (entitiesFolder) {
      this.data.entities.forEach((entity, index) => {
        const filename = `${entity.meta.id || `entity-${index}`}.json`;
        entitiesFolder.file(filename, JSON.stringify(entity, null, 2));
      });
    }

    // Add media files
    if (this.mediaFiles.size > 0) {
      const mediaFolder = zip.folder('media');
      if (mediaFolder) {
        this.mediaFiles.forEach((media) => {
          mediaFolder.file(media.filename, media.data);
        });
      }
    }

    // Generate ZIP
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Exports the container to JSON (without media)
   */
  toJSON(options: ExportOptions = {}): string {
    const { pretty = true } = options;
    return JSON.stringify(this.data, null, pretty ? 2 : 0);
  }

  /**
   * Updates the modified timestamp
   */
  private updateModifiedTime(): void {
    this.data.meta.modified = generateTimestamp();
  }
}
