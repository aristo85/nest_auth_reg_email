import { Controller, Body, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from 'src/core/guards/doesUserExist';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return await this.authService.login(req.user);
  }

  @UseGuards(DoesUserExist)
  @Post('signup')
  async signUp(@Body() user: CreateUserDto) {
    const email = user.email.toLocaleLowerCase();
    return await this.authService.createInactiveUser({
      ...user,
      email,
    });
  }

  @Post('account/confirm')
  async confirmAccount(@Body('activationCode') code: number) {
    return await this.authService.create(code);
  }
}
