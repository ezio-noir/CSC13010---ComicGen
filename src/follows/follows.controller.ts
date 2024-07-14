import { Controller, Logger } from '@nestjs/common';

@Controller('follows')
export class FollowsController {
  private readonly logger = new Logger(FollowsController.name);

  constructor() {}
}
