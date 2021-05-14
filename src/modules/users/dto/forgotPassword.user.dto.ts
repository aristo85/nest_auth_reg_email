import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly resetCode: number;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  readonly newPassword: string;
}

export class ForgotDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

export class ForgotConfirmDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly resetCode: number;
}
