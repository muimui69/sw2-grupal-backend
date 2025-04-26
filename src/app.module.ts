import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envConfig } from './config/env/env.config';
import { envSchema } from './config/env/env.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { IdentityModule } from './identity/identity.module';
import { TenantModule } from './tenant/tenant.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { PaymentModule } from './payment/payment.module';
import { SeedModule } from './seed/seed.module';
import { UserModule } from './user/user.module';
import { TicketPurchase } from './payment/entities/ticket-purchase.entity';
import { Ticket } from './event/entities/ticket.entity';
import { AuditModule } from './audit/audit.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      isGlobal: true,
      validationSchema: envSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db_host'),
        port: configService.get<number>('db_port'),
        username: configService.get<string>('db_user'),
        password: configService.get<string>('db_password'),
        database: configService.get<string>('db_name'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    EventModule,
    IdentityModule,
    TenantModule,
    BlockchainModule,
    PaymentModule,
    SeedModule,
    UserModule,
    TicketPurchase,
    Ticket,
    AuditModule,
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
