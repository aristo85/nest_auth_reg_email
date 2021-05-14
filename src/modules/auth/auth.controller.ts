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
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DoesUserExist } from 'src/core/guards/doesUserExist';
import { ConfirmAccountDto, CreateUserDto } from '../users/dto/create-user.dto';
import { Credential } from '../users/dto/credential.user.dto';
import {
  ForgotPasswordDto,
  ForgotDto,
  ForgotConfirmDto,
} from '../users/dto/forgotPassword.user.dto';
import { PassUpdateUserDto } from '../users/dto/passUpdate-user.dto';
import { User } from '../users/models/user.model';
import { AuthUser } from '../users/users.decorator';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiResponse({ status: 201, description: '{user, token }' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Body() credential: Credential, @Request() req) {
    return await this.authService.login(req.user);
  }

  @ApiResponse({ status: 201, description: '{user, token }' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @UseGuards(DoesUserExist)
  @Post('signup')
  async signUp(@Body() user: CreateUserDto) {
    const email = user.email.toLocaleLowerCase();
    return await this.authService.createInactiveUser({
      ...user,
      email,
    });
  }

  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiNotFoundResponse({ status: 404, description: 'Not Found' })
  @Post('account/confirm')
  async confirmAccount(@Body() body: ConfirmAccountDto) {
    return await this.authService.create(body.activationCode);
  }

  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiNotFoundResponse({ status: 404, description: 'Not Found' })
  @Post('forgotPassword')
  async forgotPassword(@Body() body: ForgotDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiNotFoundResponse({ status: 404, description: 'Not Found' })
  @Post('reset/confirm')
  async confirmResetForgotPassword(@Body() body: ForgotConfirmDto) {
    return await this.authService.confirmResetForgotPassword(body.resetCode);
  }

  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiNotFoundResponse({ status: 404, description: 'Not Found' })
  @Post('reset/forgotPassword')
  async resetForgotPassword(@Body() Body: ForgotPasswordDto) {
    return await this.authService.resetForgotPassword(Body);
  }

  @ApiResponse({ status: 200 })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiForbiddenResponse({ status: 403, description: 'Forbidden' })
  @ApiNotFoundResponse({ status: 404, description: 'Not Found' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'user Id',
  })
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
