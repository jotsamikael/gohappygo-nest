import { Module } from '@nestjs/common';
import { IsUniqueConstraint } from './pipe/isUniqueConstraint.pipe';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { RoleService } from 'src/role/role.service';

@Module({
      imports:[
            //Makes UserEntity available for injection
            TypeOrmModule.forFeature([UserEntity])
      ],
      providers:[UserService,IsUniqueConstraint, RoleService]
    
})
export class UserModule {}
