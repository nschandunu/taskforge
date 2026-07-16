import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ProjectsController } from './controllers/projects.controller';
import { ProjectsService } from './services/projects.service';

@Module({
  imports: [PrismaModule],

  controllers: [ProjectsController],

  providers: [ProjectsService],

  exports: [ProjectsService],
})
export class ProjectsModule {}