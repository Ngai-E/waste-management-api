import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadDir = this.configService.get<string>('upload.destination');
    const storageProvider = this.configService.get<string>('upload.storageProvider');

    if (storageProvider === 'local') {
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(uploadDir, filename);

      await fs.writeFile(filepath, file.buffer);

      // Return public URL (adjust based on your setup)
      return `/uploads/${filename}`;
    }

    // TODO: Implement S3 or Cloudinary upload
    this.logger.warn(`Storage provider ${storageProvider} not implemented yet`);
    return '';
  }
}
