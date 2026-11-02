import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KycDocumentDto {
  @IsNotEmpty()
  @IsString()
  documentType!: string; // PAN, GSTIN, CIN, CANCELLED_CHEQUE, ADDRESS_PROOF, TRADEMARK

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsNotEmpty()
  @IsString()
  fileKey!: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;
}

