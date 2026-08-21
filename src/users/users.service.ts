import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      id: this.users.length + 1,
      name: createUserDto.name,
      email: createUserDto.email,
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }
}
