import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){

    }

    @Get()
    getAllUsers(){
        return this.userService.getAllUsers();
    }

     @Get('/:idUser')
    getAllUserById(@Param('idUser', ParseIntPipe) idUser: number){
        
        return this.userService.getUserById(idUser); 
    }

}
