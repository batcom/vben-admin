import { Global, Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envFile = path.resolve(__dirname, '../../.env');
  const envDevFile = path.resolve(__dirname, '../../.env.development');

  if (fs.existsSync(envDevFile)) {
    dotenv.config({ path: envDevFile });
  } else if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

loadEnv();

@Global()
@Module({
  providers: [
    {
      provide: 'CONFIG',
      useValue: {
        jwt: {
          secret: process.env.JWT_SECRET || 'default-secret',
          refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
          expiresIn: process.env.JWT_EXPIRES_IN || '15m',
          refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        },
      },
    },
  ],
  exports: ['CONFIG'],
})
export class ConfigModule {}
