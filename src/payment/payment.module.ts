import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Purchase } from './entities/purchase.entity';
import { TicketPurchase } from './entities/ticket-purchase.entity';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Purchase,
      TicketPurchase
    ]),
  ],
})
export class PaymentModule { }


