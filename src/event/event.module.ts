import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Section } from './entities/section.entity';
import { Faculty } from './entities/faculty.entity';
import { EventService } from './services/event.service';
import { TenantModule } from '../tenant/tenant.module';
import { EventController } from './controllers/event.controller';
// import { SectionService } from './services/section.service';
import { UserModule } from '../user/user.module';
import { FacultyService } from './services/faculty.service';
import { FacultyController } from './controllers/faculty.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Section,
      Faculty
    ]),
    TenantModule,
    UserModule,
  ],
  controllers: [
    EventController,
    FacultyController
  ],
  providers: [
    EventService,
    FacultyService
  ],
  exports: [
    EventService,
  ]
})
export class EventModule { }