import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  /**
   * Gender ID: 1 for Male, 2 for Female, 3 for Other
   * Also accepts string "MALE", "FEMALE", "OTHER" which auto-maps to the numeric ID
   */
  @IsOptional()
  gender?: number | string;

  /**
   * Date of Birth in Date, Month, Year format (DD-MM-YYYY)
   * e.g. "15-05-1998"
   */
  @IsOptional()
  dateOfBirth?: string;

  @IsOptional()
  date?: number;

  @IsOptional()
  month?: number;

  @IsOptional()
  year?: number;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[0-9\s-]{10,15}$/, {
    message: 'Alternate phone must be a valid 10-digit mobile number',
  })
  alternatePhone?: string;
}
