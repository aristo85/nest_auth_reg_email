import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  Put,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DoesUserExist } from 'src/core/guards/doesUserExist';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ForgotPasswordDto } from '../users/dto/forgotPassword.user.dto';
import { PassUpdateUserDto } from '../users/dto/passUpdate-user.dto';
import { User } from '../users/models/user.model';
import { AuthUser } from '../users/users.decorator';
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

  @Post('forgotPassword')
  async forgotPassword(@Body('email') email: string) {
    return await this.authService.forgotPassword(email);
  }

  @Post('reset/confirm')
  async confirmResetForgotPassword(@Body('resetCode') resetCode: number) {
    return await this.authService.confirmResetForgotPassword(resetCode);
  }

  @Post('reset/forgotPassword')
  async resetForgotPassword(@Body() Body: ForgotPasswordDto) {
    return await this.authService.resetForgotPassword(Body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('password/:id')
  async resetPassword(
    @Param('id') id: number,
    @Body() body: PassUpdateUserDto,
    @AuthUser() user: User,
  ): Promise<User> {
    // check id
    if (user._id !== id) {
      throw new ForbiddenException('not your ID');
    }
    return await this.authService.updatePassword(user, body);
  }
}
