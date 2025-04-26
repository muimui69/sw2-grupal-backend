import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Section } from './entities/section.entity';
import { Faculty } from './entities/faculty.entity';
import { EventService } from './services/event.service';
import { TenantModule } from '../tenant/tenant.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventController } from './controllers/event.controller';
// import { FacultyService } from './services/faculty.service';
// import { SectionService } from './services/section.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Section,
      Faculty
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('secret_key_jwt'),
        signOptions: { expiresIn: '24h' },
      }),
      }),
    TenantModule,
    UserModule,
  ],
  controllers: [EventController],
  providers: [
    EventService,
  ],
  exports: [
    EventService,
  ]
})
export class EventModule { }