import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService,
              private readonly configService: ConfigService) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0]
      const token = authHeader.split(' ')[1]
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: "Вы не авторизованы" });
      }
      req.user = this.jwtService.verify(token, {secret: this.configService.get('JWT_SECRET')})
      return true
      // return req.user
    } catch (error) {
      throw new UnauthorizedException({ message: "Вы не авторизованы" });
    }

  }

}