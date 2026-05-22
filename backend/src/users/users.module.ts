import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserInfoController } from './user-info.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UserInfoController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
