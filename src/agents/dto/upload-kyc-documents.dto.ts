import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadKycDocumentsDto {
  @ApiPropertyOptional({
    example: 'https://storage.example.com/id-document.jpg',
    description: 'URL of the ID document'
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  idDocumentUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/driver-license.jpg',
    description: 'URL of the driver license'
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  driverLicenseUrl?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/vehicle-registration.jpg',
    description: 'URL of the vehicle registration document'
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  vehicleRegistrationUrl?: string;
}
