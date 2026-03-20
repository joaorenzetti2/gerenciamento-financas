import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './typeorm.config';
import { SeedService } from './seeds/seed.service';
import { Category } from '../modules/categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    TypeOrmModule.forFeature([Category]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
