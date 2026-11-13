import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const mongodbConfig: TypeOrmModuleOptions = {
    type: 'mongodb',
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/h04_lecture',
    entities: [__dirname + '/../../**/entities/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
};
