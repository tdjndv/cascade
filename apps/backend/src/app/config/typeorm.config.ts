// apps/backend/src/app/config/typeorm.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InitialSchema1790198215298 } from '../../migrations/1790198215298-InitialSchema';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.getOrThrow<string>('DB_HOST'),
  port: Number(config.getOrThrow('DB_PORT')),
  username: config.getOrThrow<string>('DB_USER'),
  password: config.getOrThrow<string>('DB_PASSWORD'),
  database: config.getOrThrow<string>('DB_NAME'),
  autoLoadEntities: true,
  synchronize: false,
  // Imported explicitly — webpack tree-shakes migrations nothing references.
  // Add every new migration class to this array or it will silently never run.
  migrations: [InitialSchema1790198215298],
  migrationsRun: true,
});
