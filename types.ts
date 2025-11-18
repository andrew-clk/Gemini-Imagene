export enum EditorMode {
  IMAGE_GENERATION = 'image_generation',
  VARIATIONS = 'variations',
  MERGE = 'merge',
  EDIT = 'edit',
  STYLE_TRANSFER = 'style_transfer',
  BULK_PROCESS = 'bulk_process',
}

export interface ImageFile {
  name: string;
  dataUrl: string;
  mimeType: string;
}
