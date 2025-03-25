import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { META_ROLES } from '../../../auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validRole: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (validRole.length == 0) return true;

    const req = context.switchToHttp().getRequest();
    const userRequest = req.user as User;

    if (!userRequest)
      throw new BadRequestException('the user not found in the request');

    const user = await this.userRepository.findOne({
      where: { id: userRequest.id },
      relations: ['role'],
    });

    const roleOfUser = user.role.name;

    if (validRole.includes(roleOfUser)) return true;
    throw new ForbiddenException(
      `User ${user.fullname} need a valid role: ${validRole}`,
    );
  }
}
