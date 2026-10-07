import { Injectable } from '@nestjs/common';
import { StoragePort, UploadFileOptions } from '../../application/ports/storage.port';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly baseUploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    try {
      await fs.mkdir(this.baseUploadDir, { recursive: true });
    } catch (error) {
      console.error('Error al crear el directorio local de uploads:', error);
    }
  }

  async upload(options: UploadFileOptions): Promise<string> {
    const subDir = options.path || 'general';
    const finalDir = path.join(this.baseUploadDir, subDir);
    
    await fs.mkdir(finalDir, { recursive: true });

    // Generar un nombre único para evitar colisiones
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const finalFileName = `${uniqueSuffix}-${options.fileName}`;
    const filePath = path.join(finalDir, finalFileName);

    await fs.writeFile(filePath, options.buffer);

    // Retorna una ruta relativa que luego puede servirse estáticamente en NestJS (/uploads/...)
    // Cuando se migre a MinIO, aquí retornará la URL de S3/MinIO.
    return `/uploads/${subDir}/${finalFileName}`;
  }

  async delete(fileUrl: string): Promise<void> {
    try {
      // fileUrl esperado: /uploads/subDir/filename.ext
      const relativePath = fileUrl.replace('/uploads/', '');
      const absolutePath = path.join(this.baseUploadDir, relativePath);
      await fs.unlink(absolutePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error; // Solo lanzar si el error no es "El archivo no existe"
      }
    }
  }

  async getSignedUrl(fileUrl: string): Promise<string> {
    // Localmente, la URL es directamente accesible asumiendo que servimos estáticos
    return fileUrl;
  }
}
