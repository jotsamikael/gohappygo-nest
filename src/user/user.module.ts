import { Module } from '@nestjs/common';
import { IsUniqueConstraint } from './pipe/isUniqueConstraint.pipe';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RoleModule } from 'src/role/role.module';

@Module({
      imports:[
            //Makes UserEntity available for injection
            TypeOrmModule.forFeature([UserEntity]),
            RoleModule
      ],
      providers:[UserService,IsUniqueConstraint],
      exports:[UserService]
    
})
export class UserModule {}
