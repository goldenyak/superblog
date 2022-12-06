import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
	constructor() {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest();
		try {
			const authHeader = req.headers.authorization;
      const authType = req.headers.authorization.split(" ")[0].toString()
			const authPhrase = authHeader.split(' ')[1];
      if (authType === 'Bearer') {
        if (authPhrase === 'YWRtaW46cXdlcnR5') {
          return true
        } else {
          throw new UnauthorizedException({ message: 'Вы не авторизованы' });
        }
      }
		} catch (error) {
			throw new UnauthorizedException({ message: 'Вы не авторизованы' });
		}
	}
}
