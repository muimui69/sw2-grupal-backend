import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityVerification } from './entities/identity-verification.entity';

@Module({
  controllers: [IdentityController],
  providers: [IdentityService],
  imports: [
    TypeOrmModule.forFeature([
      IdentityVerification
    ])
  ]
})
export class IdentityModule { }
