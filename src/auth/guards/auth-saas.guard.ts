import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from 'src/user/services/user.service';
import { useToken } from 'src/utils/user.token';

@Injectable()
export class AuthSaasGuard implements CanActivate {
    constructor(
        private readonly userService: UserService
    ) { }

    async canActivate(
        context: ExecutionContext,
    ) {
        const req = context.switchToHttp().getRequest<Request>();
        const token = req.headers["auth-token"]
        if (!token || Array.isArray(token))
            throw new UnauthorizedException("subdomain in not domain");

        const manageToken = useToken(token);
        if (typeof manageToken === "string")
            throw new UnauthorizedException(manageToken);

        if (manageToken.isExpired)
            throw new UnauthorizedException('Token expired');

        const findUser = await this.userService.findIdUser(manageToken.userId);

        if (!findUser)
            throw new UnauthorizedException("user not found")

        req.userId = findUser.id;
        return true;
    }
}