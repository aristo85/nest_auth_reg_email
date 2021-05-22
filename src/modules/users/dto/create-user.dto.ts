import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail, IsEnum } from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OR = ''
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @ApiProperty({ enum: ['male', 'female'] })
  @IsEnum(Gender, {
    message: 'gender must be either male or female',
  })
  readonly gender: Gender;
  
  @ApiProperty()
  readonly facebookData: any;
}

export class ConfirmAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly activationCode: number;
}
