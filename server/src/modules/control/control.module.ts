import { Module } from '@nestjs/common';
import { ControlController } from './control.controller';
import { RuleEngineService } from './rule-engine.service';
import { CommandService } from './command.service';

@Module({
  controllers: [ControlController],
  providers: [RuleEngineService, CommandService],
})
export class ControlModule {}
