import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Reference — shared database module boundary.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
