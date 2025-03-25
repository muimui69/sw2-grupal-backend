import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

//? decorador para obtener el usuario de la request
export const GetUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user)
      throw new InternalServerErrorException(
        'user not found (request), first UseGuards and AuthGuard()',
      );
    return user;
  },
);
