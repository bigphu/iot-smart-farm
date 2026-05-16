import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { IdentityService } from './identity.service';

@Module({
  controllers: [AuthController],
  providers: [IdentityService],
})
export class AuthModule {}
