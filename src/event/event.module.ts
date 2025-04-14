import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Faculty } from './entities/faculty.entity';
import { Section } from './entities/section.entity';
import { Ticket } from './entities/ticket.entity';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Faculty,
      Section,
      Ticket
    ])
  ]
})
export class EventModule { }
