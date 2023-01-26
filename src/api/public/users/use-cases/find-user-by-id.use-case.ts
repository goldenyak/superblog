import { Injectable } from '@nestjs/common';
import { UsersService } from "../users.service";

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly usersService: UsersService) {}


  async execute(userId: string) {
    return await this.usersService.findUserById(userId);
  }
}
