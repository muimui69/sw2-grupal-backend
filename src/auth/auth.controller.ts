import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserAdministratorDTO,
  CreateUserManagerDTO,
  CreateUserOwnerDTO,
  LoginDTO,
  RegisterUserDTO,
} from './dto';
import { CreateUserTechnicalDTO } from './dto/create-user-technical';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileChangeName } from '../common/helpers/function-helper';
import { diskStorage } from 'multer';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register-admin')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        filename: fileChangeName,
        destination: './static/files',
      }),
    }),
  )
  registerAdmin(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserAdministratorDTO: CreateUserAdministratorDTO,
  ) {
    return this.authService.createUserAdministrator(
      createUserAdministratorDTO,
      file,
    );
  }

  @Post('register-manager')
  registerManager(@Body() createUserManagerDTO: CreateUserManagerDTO) {
    return this.authService.createUserManager(createUserManagerDTO);
  }

  @Post('register-technical')
  registerTechnical(@Body() createUserTechnicalDTO: CreateUserTechnicalDTO) {
    return this.authService.createUserTechnical(createUserTechnicalDTO);
  }

  @Post('register-owner')
  registerOwner(@Body() createUserOwnerDTO: CreateUserOwnerDTO) {
    return this.authService.createUserOwner(createUserOwnerDTO);
  }

  @Post('login')
  login(@Body() loginDTO: LoginDTO) {
    return this.authService.login(loginDTO);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
