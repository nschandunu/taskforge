import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { HealthService } from '../services/health.service';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check',
  })
  health() {
    return this.healthService.getHealth();
  }
}