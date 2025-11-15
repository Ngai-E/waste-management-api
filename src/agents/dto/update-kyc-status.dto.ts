import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus } from '../../common/enums/kyc-status.enum';

export class UpdateKycStatusDto {
  @ApiProperty({ 
    example: KycStatus.APPROVED,
    enum: KycStatus,
    description: 'New KYC status'
  })
  @IsEnum(KycStatus)
  @IsNotEmpty()
  kycStatus: KycStatus;

  @ApiPropertyOptional({
    example: 'ID document is not clear. Please upload a better quality image.',
    description: 'Reason for rejection (required when status is REJECTED)'
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
