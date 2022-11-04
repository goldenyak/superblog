import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader = req.headers.authorization;
      const bearer = authHeader.split(' ')[0]
      const token = authHeader.split(' ')[1]
      console.log(token);
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: "Вы не авторизованы" });
      }
      req.user = this.jwtService.verify(token, {secret: 'secret'})
      return true
    } catch (error) {
      // throw new UnauthorizedException({ message: "Вы не авторизованы" });
      console.log(error.message);
    }

  }

}