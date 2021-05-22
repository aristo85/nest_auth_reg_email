import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class CronService {
  constructor(private readonly userService: UsersService) {}
  @Cron('*/15 * * * *')
  async runEveryHour() {
    await this.userService.clearExpireInactiveUser();
    await this.userService.clearExpireForgotPassUser();
    console.log('every15min');
  }
}
