import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class Credential {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;
  
    @ApiProperty({ minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;
  }