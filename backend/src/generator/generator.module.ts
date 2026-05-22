import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { IntrospectionService } from './introspection.service';

@Module({
  controllers: [GeneratorController],
  providers: [IntrospectionService, GeneratorService],
})
export class GeneratorModule {}
