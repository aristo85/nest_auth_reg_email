import { IsNotEmpty } from 'class-validator';

export class PassUpdateUserDto {
  @IsNotEmpty()
  readonly oldPassword: string;

  @IsNotEmpty()
  readonly newPassword: string;
}
