import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './models/user.model';
import { InactiveUserSchema } from './models/inactiveUser.model';
import { ForgotPasswordUserSchema } from './models/forgotPasswordUser.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'InactiveUser', schema: InactiveUserSchema },
      { name: 'ForgotPasswordUser', schema: ForgotPasswordUserSchema },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
