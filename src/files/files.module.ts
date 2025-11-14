import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
