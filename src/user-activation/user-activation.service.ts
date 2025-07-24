import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActivationEntity } from './user-activation.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class UserActivationService {
  
  constructor(
    @InjectRepository(UserActivationEntity)
    private userActivationRepository: Repository<UserActivationEntity>,
  ) {}

  async recordUserActivation(
    user: UserEntity,
    activationCode: number,
  ): Promise<UserActivationEntity> {
    const expiresAt = new Date(Date.now() + 120 * 60 * 1000); // expires in 2 hours

    const newActivation = this.userActivationRepository.create({
      code: activationCode.toString(), // store as string if DB column is string
      expiresAt,
      user,
    });

    const userActivationRecord =
      await this.userActivationRepository.save(newActivation);
    return userActivationRecord;
  }

  //Get validation code of user that is not expired and is not yet validated
  async getLatestValidActivationCode(user: UserEntity): Promise<UserActivationEntity | null>{
    const latestActivation = await this.userActivationRepository.findOne({
            where: {
              user: { id: user.id },
              expiresAt: MoreThan(new Date()),
              validatedAt: IsNull(),
            },
            order: { createdAt: 'DESC' },
          });

     return latestActivation;     
  }


  async setValidatedDate(latestActivation: UserActivationEntity) {
     latestActivation.validatedAt = new Date();
    await this.userActivationRepository.save(latestActivation);
  }
}
