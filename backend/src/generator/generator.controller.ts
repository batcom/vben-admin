import * as fs from 'fs';
import * as path from 'path';
import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { GeneratorService } from './generator.service';
import { IntrospectionService } from './introspection.service';

@Controller('generator')
export class GeneratorController {
  constructor(
    private introspectionService: IntrospectionService,
    private generatorService: GeneratorService,
  ) {}

  @Get('tables')
  @RequirePermission('generator:list')
  listTables() {
    return this.introspectionService.listTables();
  }

  @Get('tables/:tableName/columns')
  @RequirePermission('generator:list')
  getTableColumns(@Param('tableName') tableName: string) {
    return this.introspectionService.getColumns(tableName);
  }

  @Post('preview')
  @RequirePermission('generator:generate')
  async preview(
    @Body()
    body: {
      tableName: string;
      moduleName: string;
      modulePath: string;
      apiPrefix: string;
    },
  ) {
    if (!body.tableName || !body.moduleName || !body.modulePath || !body.apiPrefix) {
      throw new BadRequestException('tableName, moduleName, modulePath, apiPrefix are required');
    }
    const columns = await this.introspectionService.getColumns(body.tableName);
    const config = { ...body, columns };

    return {
      backend: this.generatorService.generateBackend(config),
      frontend: this.generatorService.generateFrontend(config),
    };
  }

  @Post('generate')
  @RequirePermission('generator:generate')
  async generate(
    @Body()
    body: {
      tableName: string;
      moduleName: string;
      modulePath: string;
      apiPrefix: string;
    },
  ) {
    if (!body.tableName || !body.moduleName || !body.modulePath || !body.apiPrefix) {
      throw new BadRequestException('tableName, moduleName, modulePath, apiPrefix are required');
    }
    const columns = await this.introspectionService.getColumns(body.tableName);
    const config = { ...body, columns };

    const backend = this.generatorService.generateBackend(config);
    const frontend = this.generatorService.generateFrontend(config);

    // Write backend files
    const backendDir = path.join(process.cwd(), 'src', body.modulePath);
    for (const [filename, content] of Object.entries(backend)) {
      const filePath = path.join(backendDir, filename);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    // Write frontend files
    const frontendDir = path.join(
      process.cwd(),
      '..',
      'frontend',
      'apps',
      'web-antd',
      'src',
      'views',
      body.modulePath,
    );
    for (const [filename, content] of Object.entries(frontend)) {
      const filePath = path.join(frontendDir, filename);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    return {
      message: 'Code generated successfully',
      backendPath: backendDir,
      frontendPath: frontendDir,
      files: [...Object.keys(backend), ...Object.keys(frontend)],
    };
  }
}
