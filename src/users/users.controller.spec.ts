import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an empty list initially', () => {
    expect(controller.findAll()).toEqual([]);
  });

  it('should create and return a user', () => {
    const user = controller.create({ name: 'Hien', email: 'hien@example.com' });
    expect(user.id).toBe(1);
    expect(user.name).toBe('Hien');
    expect(user.email).toBe('hien@example.com');
  });

  it('should ignore undeclared DTO properties', () => {
    const payload = {
      name: 'Hien',
      email: 'hien@example.com',
      password: 'should-not-leak',
    };

    const user = controller.create(payload);

    expect(user).not.toHaveProperty('password');
  });
});
