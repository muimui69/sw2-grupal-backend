import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User } from 'src/auth/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    NestjsFormDataModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [
    UserService
  ]
})
export class UserModule { }
