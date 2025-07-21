import { BaseEntity } from "src/baseEntity/base.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, Entity, OneToMany } from "typeorm";

/*@jotsamikael
*Defines user access roles (e.g., admin, traveler, sender). 
*Used to manage permissions and business logic based on user types.
*
*/
@Entity()
export class UserRoleEntity extends BaseEntity{

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(()=>UserEntity, (user)=>user.role)
    users: UserEntity[];

}