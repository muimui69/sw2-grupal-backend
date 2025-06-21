import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantModule } from 'src/tenant/tenant.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { IdentityVerification } from './entities/identity-verification.entity';
import { TicketPurchase } from 'src/payment/entities/ticket-purchase.entity';
import { IdentityVerificationController } from './controllers/identity.controller';
import { IdentityVerificationService } from './services/identity.service';

@Module({
  controllers: [IdentityVerificationController],
  providers: [IdentityVerificationService],
  imports: [
    TypeOrmModule.forFeature([
      IdentityVerification,
      TicketPurchase
    ]),
    TenantModule,
    AuthModule,
    UserModule
  ]
})
export class IdentityModule { }
