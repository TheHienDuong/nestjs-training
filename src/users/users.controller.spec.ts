import { Test, type TestingModule } from '@nestjs/testing';
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

  it('creates and returns a user', () => {
    expect(
      controller.create({ name: 'Hien', email: 'hien@example.com' }),
    ).toEqual({ id: 1, name: 'Hien', email: 'hien@example.com' });
  });
});
