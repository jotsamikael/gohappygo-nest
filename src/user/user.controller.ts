import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from './user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){

    }

    @Get()
    getAllUsers(){
        return this.userService.getAllOperators();
    }

     @Get('/:idUser')
    getAllUserById(@Param('idUser', ParseIntPipe) idUser: number){
        
        return this.userService.getUserById(idUser); 
    }

    @Post('create-staff')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    createStaff(@Body() createUserDto: CreateUserDto, @CurrentUser() user:any){
    }

}
