import { ApiProperty } from '@nestjs/swagger';
import { ProjectMemberRole } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class AddProjectMemberDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: ProjectMemberRole,
  })
  @IsEnum(ProjectMemberRole)
  role: ProjectMemberRole;
}