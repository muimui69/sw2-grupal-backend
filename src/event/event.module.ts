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
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { SectionController } from './controllers/section.controller';
import { SectionService } from './services/section.service';
import { TicketController } from './controllers/ticket.controller';
import { TicketService } from './services/ticket.service';
import { Ticket } from './entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Section,
      Faculty,
      Ticket
    ]),
    TenantModule,
    UserModule,
    CloudinaryModule
  ],
  controllers: [
    EventController,
    FacultyController,
    SectionController,
    TicketController
  ],
  providers: [
    EventService,
    FacultyService,
    SectionService,
    TicketService,
    CloudinaryService
  ],
  exports: [
    EventService,
  ]
})
export class EventModule { }