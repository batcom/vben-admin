import { Module } from '@nestjs/common';
import { FieldpermissionController } from './fieldpermission.controller';
import { FieldpermissionService } from './fieldpermission.service';

@Module({
  controllers: [FieldpermissionController],
  providers: [FieldpermissionService],
})
export class FieldpermissionModule {}
