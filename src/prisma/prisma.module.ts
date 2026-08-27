import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// [NES-8 · lesson 07] Reference — shared database module boundary.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
