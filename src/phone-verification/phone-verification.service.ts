import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PhoneVerificationEntity } from './phone-verification.entity';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class PhoneVerificationService {
  
  constructor(
    @InjectRepository(PhoneVerificationEntity)
    private phoneVerificationRepository: Repository<PhoneVerificationEntity>,
  ) {}

  async recordPhoneVerification(
    user: UserEntity,
    verificationCode: string,
  ): Promise<PhoneVerificationEntity> {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    const newVerification = this.phoneVerificationRepository.create({
      code: verificationCode,
      expiresAt,
      user,
    });

    const phoneVerificationRecord = await this.phoneVerificationRepository.save(newVerification);
    return phoneVerificationRecord;
  }

  async getLatestValidPhoneVerificationCode(user: UserEntity): Promise<PhoneVerificationEntity | null> {
    const latestVerification = await this.phoneVerificationRepository.findOne({
      where: {
        user: { id: user.id },
        expiresAt: MoreThan(new Date()),
        validatedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    return latestVerification;
  }

  async setValidatedDate(verification: PhoneVerificationEntity) {
    verification.validatedAt = new Date();
    await this.phoneVerificationRepository.save(verification);
  }
}