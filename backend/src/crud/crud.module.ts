import { DynamicModule, Module } from '@nestjs/common';
import './processors/builtin'; // register built-in processors
import { AdminCrudController } from './admin-crud.controller';
import { MenuAllController } from './menu-all.controller';
import { PublicApiController } from './public-api.controller';
import { CrudMetaService } from './crud.meta';
import { CrudRegistry } from './crud.registry';
import type { CrudModuleConfig } from './crud.types';

@Module({})
export class CrudModule {
  static forRoot(config: CrudModuleConfig): DynamicModule {
    const registry = new CrudRegistry();
    for (const app of config.apps) {
      registry.registerApp(app);
    }

    const controllers = [AdminCrudController, PublicApiController, MenuAllController];
    // For additional apps, add more concrete controllers here.

    return {
      module: CrudModule,
      global: true,
      controllers,
      providers: [
        { provide: CrudRegistry, useValue: registry },
        CrudMetaService,
      ],
      exports: [CrudRegistry],
    };
  }
}
