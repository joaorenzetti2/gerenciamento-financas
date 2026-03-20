import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const url = configService.get<string>('DATABASE_URL');

  if (url) {
    console.log('📦 Database: Using connection string (DATABASE_URL)');
    return {
      type: 'postgres',
      url,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Em produção para portfólio, automatiza o schema
      logging: true,
      extra: {
        client_encoding: 'UTF8',
      },
      ssl: url.includes('neon.tech') ? { rejectUnauthorized: false } : false,
    };
  }

  console.log(`📡 Database: Falling back to discrete variables (Host: ${configService.get('DB_HOST', 'localhost')})`);
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password123'),
    database: configService.get<string>('DB_NAME', 'finances_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: true,
    extra: {
      client_encoding: 'UTF8',
    },
  };
};
