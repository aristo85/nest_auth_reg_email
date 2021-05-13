import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class InactiveUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  readonly activationCode: number;
}
