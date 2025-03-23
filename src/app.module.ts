import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from './config/env/env.config';
import { envSchema } from './config/env/env.schema';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: envSchema
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
    })
  ],
  // providers: [
  //   LogsService,
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useClass: LogsInterceptor,
  //   },
  // ],
})
export class AppModule { }
