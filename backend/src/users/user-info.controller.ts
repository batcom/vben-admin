import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserInfoController {
  constructor(private usersService: UsersService) {}

  @Get('info')
  async getInfo(@CurrentUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }
}
