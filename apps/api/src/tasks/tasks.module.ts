import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ActivitiesModule } from '../activities/activities.module';

import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [
    PrismaModule,
    ActivitiesModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}