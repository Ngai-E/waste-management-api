import { IsString, IsNotEmpty, IsEmail, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '../../common/enums/kyc-status.enum';

export class CreateAgentDto {
  @ApiProperty({ example: 'Agent John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'agent@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+237670000001' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '123 Main St, Douala' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Akwa' })
  @IsString()
  @IsOptional()
  quarter?: string;

  @ApiPropertyOptional({ example: 'Motorcycle' })
  @IsString()
  @IsOptional()
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'DLA-123-ABC' })
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @ApiPropertyOptional({ 
    example: KycStatus.APPROVED,
    enum: KycStatus,
    description: 'Initial KYC status (admin can set to APPROVED directly)'
  })
  @IsEnum(KycStatus)
  @IsOptional()
  kycStatus?: KycStatus;
}
