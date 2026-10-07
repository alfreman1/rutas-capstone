export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadFileOptions {
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  path?: string; // Carpeta destino (e.g. 'firmas', 'evidencias')
}

export interface StoragePort {
  /**
   * Sube un archivo y retorna su URL pública o identificador para lectura
   */
  upload(options: UploadFileOptions): Promise<string>;
  
  /**
   * Elimina un archivo
   */
  delete(fileUrl: string): Promise<void>;
  
  /**
   * Obtiene la URL temporal/firmada de un archivo (para MinIO privado a futuro)
   */
  getSignedUrl(fileUrl: string): Promise<string>;
}
