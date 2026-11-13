import 'dotenv/config';   // load .env before the config files below read process.env
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { postgresConfig } from './postgres.config';
import { sqliteConfig } from './sqlite.config';
import { mongodbConfig } from './mongodb.config';

export function getDatabaseConfig(): TypeOrmModuleOptions {
    switch ((process.env.DATABASE_TYPE ?? 'sqlite').toLowerCase()) {
        case 'postgres':
        case 'postgresql':
        return postgresConfig;
        case 'mongo':
        case 'mongodb':
        return mongodbConfig;
        case 'sqlite':
        default:
        return sqliteConfig;
    }
}