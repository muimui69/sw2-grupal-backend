import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Faculty } from './entities/faculty.entity';
import { Purchase } from './entities/purchase.entity';
import { Section } from './entities/section.entity';
import { TicketPurchase } from './entities/ticket-purchase.entity';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Faculty,
      Purchase,
      Section,
      TicketPurchase
    ])
  ]
})
export class EventModule { }
