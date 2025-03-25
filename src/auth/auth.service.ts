/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Administrator, Manager, Owner, Technical, User } from './entities';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import {
  CreateUserAdministratorDTO,
  CreateUserManagerDTO,
  CreateUserTechnicalDTO,
} from './dto';

import { handleError } from '../common/helpers/function-helper';
import { Role } from '../administration/entities';
import { LoginDTO } from './dto/login.dto';
import { CreateUserOwnerDTO } from './dto/create-user-owner.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('Auth Service');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,

    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,

    @InjectRepository(Technical)
    private readonly technicalRepository: Repository<Technical>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,

    private readonly jwtService: JwtService,
  ) { }

  async login(loginDTO: LoginDTO) {
    try {
      const { email, password } = loginDTO;
      const user = await this.userRepository.findOne({
        where: { email },
        select: {
          id: true,
          fullname: true,
          lastname: true,
          email: true,
          password: true,
          phone: true,
          photoUrl: true,
          gender: true,
          type_user: true,
          codeCountry: true,
          created_at: true,
          updated_at: true,
          isEmailSend: true,
        },
        relations: ['role'],
      });

      if (!user)
        throw new UnauthorizedException(
          `the user with email: ${email} not found`,
        );
      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException(`the password are different`);

      const { password: pass, role, ...userData } = user;
      const { user: users, ...roleData } = role;

      const response = {
        ...userData,
        role: { ...roleData },
        token: this.getToken({ id: user.id }),
      };

      this.logger.log('Login EXECUTE');

      return response;
    } catch (error) {
      handleError(error);
    }
  }
  //? ---------------------------------------- CREATE USERS FUNCTIONS
  async createUserAdministrator(
    createUserAdministratorDTO: CreateUserAdministratorDTO,
    file: Express.Multer.File,
  ) {
    try {
      const roleDefault = await this.roleRepository.findOne({
        where: { name: 'ADMINISTRADOR' },
      });
      if (!roleDefault)
        throw new InternalServerErrorException(
          'error, the default role for admin no exist',
        );

      const { password, passwordConfirm, profession, ...userData } =
        createUserAdministratorDTO;
      if (password !== passwordConfirm)
        throw new BadRequestException(`the user password are different `);

      const user = this.userRepository.create({
        ...userData,
        type_user: 0,
        password: bcrypt.hashSync(password, 10),
      });
      user.role = roleDefault;
      await this.userRepository.save(user);

      const administrator = this.administratorRepository.create({
        profession,
        user,
      });
      await this.administratorRepository.save(administrator);
      const { user: userAdmin, ...admin } = administrator;
      const { password: pass, role: roleAdmin, ...userAdminData } = userAdmin;
      const { user: userRol, ...rolAd } = roleAdmin;
      const response = {
        ...admin,
        user: { ...userAdminData },
        role: { ...rolAd },
        token: this.getToken({ id: userAdmin.id }),
      };
      return response;
    } catch (error) {
      handleError(error);
    }
  }

  async createUserManager(createUserManager: CreateUserManagerDTO) {
    try {
      const { responsibility, password, passwordConfirm, ...userData } =
        createUserManager;
      const roleDefault = await this.roleRepository.findOne({
        where: { name: 'ENCARGADO' },
        relations: ['permissions'],
      });

      if (!roleDefault)
        throw new InternalServerErrorException(
          'error, the role default for Manager no exists',
        );
      if (password !== passwordConfirm)
        throw new BadRequestException('the user password are different');
      const userManager = this.userRepository.create({
        ...userData,
        type_user: 0,
        password: bcrypt.hashSync(password, 10),
      });
      userManager.role = roleDefault;
      await this.userRepository.save(userManager);

      const manager = this.managerRepository.create({
        responsibility,
        user: userManager,
      });

      await this.managerRepository.save(manager);
      const { user, ...managerData } = manager;
      const { password: pass, role, ...userRestData } = user;
      const { user: userRole, ...rol } = role;
      const response = {
        ...managerData,
        user: { ...userRestData },
        role: { ...rol },
        token: this.getToken({ id: userRestData.id }),
      };
      return response;
    } catch (error) {
      handleError(error);
    }
  }

  async createUserTechnical(createUserTechnical: CreateUserTechnicalDTO) {
    try {
      this.logger.log('create user technical execute');
      const { specialty, contract_date, ...userRestData } = createUserTechnical;

      const roleDefault = await this.roleRepository.findOne({
        where: { name: 'TECNICO' },
      });
      if (!roleDefault)
        throw new InternalServerErrorException(
          'the default role for techinical no exist',
        );
      const { password, passwordConfirm } = userRestData;
      if (password !== passwordConfirm)
        throw new BadRequestException(`the user password are different`);
      const userData = this.userRepository.create({
        ...userRestData,
        type_user: 0,
        password: bcrypt.hashSync(password, 10),
      });
      userData.role = roleDefault;
      await this.userRepository.save(userData);

      const technical = this.technicalRepository.create({
        specialty,
        contract_date,
        user: userData,
      });

      await this.technicalRepository.save(technical);
      const { user, ...data } = technical;
      const { role, password: passUser, ...userRest } = user;
      const { user: userRole, ...roleData } = role;
      const response = {
        ...data,
        user: { ...userRest },
        role: { ...roleData },
        token: this.getToken({ id: userRest.id }),
      };

      this.logger.log('create user technical !!!!');

      return response;
    } catch (error) {
      this.logger.log('create user technical ERROR!!!!');
      handleError(error);
    }
  }

  async createUserOwner(createUserOwnerDTO: CreateUserOwnerDTO) {
    try {
      const { age, password, passwordConfirm, ...userData } =
        createUserOwnerDTO;

      if (password !== passwordConfirm)
        throw new BadRequestException('the user password are different');

      const roleDefault = await this.roleRepository.findOne({
        where: { name: 'PROPIETARIO' },
      });

      if (!roleDefault)
        throw new InternalServerErrorException('the role default no exists');

      const user = this.userRepository.create({
        ...userData,
        type_user: 0,
        password: bcrypt.hashSync(password, 10),
      });

      user.role = roleDefault;
      await this.userRepository.save(user);

      const userOwner = this.ownerRepository.create({
        age,
        user,
      });

      await this.ownerRepository.save(userOwner);

      const { user: userRestData, ...userStandarData } = userOwner;
      const { password: pass, role, ...userInsertData } = userRestData;
      const { user: userRole, ...roleUserStandar } = role;
      const response = {
        ...userStandarData,
        user: { ...userInsertData },
        role: { ...roleUserStandar },
      };
      return response;
    } catch (error) {
      handleError(error);
    }
  }

  //? ---------------------------------------- PRIVATE FUNCTIONS

  private getToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findOneManager(user: User) {
    try {
      const { id } = user;
      const manager: Manager = await this.managerRepository.findOne({
        where: { user: { id } },
      });
      if (!manager) throw new NotFoundException(`manager not found`);
      return manager;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneTechnical(user: User) {
    try {
      const { id } = user;
      const technical: Technical = await this.technicalRepository.findOne({
        where: { user: { id } },
      });
      if (!technical) throw new NotFoundException(`manager not found`);
      return technical;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneOwner(user: User) {
    try {
      const { id } = user;
      const owner: Owner = await this.ownerRepository.findOne({
        where: { user: { id } },
      });
      if (!owner) throw new NotFoundException(`manager not found`);
      return owner;
    } catch (error) {
      handleError(error);
    }
  }

  async findOneAdmin(user: User) {
    try {
      const { id } = user;
      const admin: Administrator = await this.administratorRepository.findOne({
        where: { user: { id } },
      });
      if (!admin) throw new NotFoundException(`manager not found`);
      return admin;
    } catch (error) {
      handleError(error);
    }
  }
  //? check status token

  async checkAuthStatus(user: User) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        select: {
          id: true,
          fullname: true,
          lastname: true,
          email: true,
          password: true,
          phone: true,
          photoUrl: true,
          gender: true,
          type_user: true,
          codeCountry: true,
          created_at: true,
          updated_at: true,
          isEmailSend: true,
        },
        relations: ['role'],
      });

      if (!user) throw new UnauthorizedException(`the user not found`);

      const { password: pass, role, ...restData } = userData;
      const { user: userD, ...roleData } = role;

      const response = {
        ...restData,
        role: { ...roleData },
        token: this.getToken({ id: user.id }),
      };

      this.logger.log('check auth status EXECUTE');

      return response;
    } catch (error) { }
  }
}
