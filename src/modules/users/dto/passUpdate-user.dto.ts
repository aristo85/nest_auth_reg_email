import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PassUpdateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly newPassword: string;
}
