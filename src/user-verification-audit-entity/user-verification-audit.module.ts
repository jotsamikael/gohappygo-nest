import { Module } from '@nestjs/common';
import { UserVerificationAuditService } from './user-verification-audit.service';
import { UserVerificationAuditController } from './user-verification-audit.controller';

@Module({
  controllers: [UserVerificationAuditController],
  providers: [UserVerificationAuditService],
  exports:[UserVerificationAuditService]
})
export class UserVerificationAuditEntityModule {}
