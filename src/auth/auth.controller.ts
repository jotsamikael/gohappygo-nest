import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorattor';
import { Roles } from './decorators/role.decorators';
import { UserRole } from '../user/user.entity';
import { RolesGuard } from './guards/roles-guard';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService){}

    @Post('register')
    register(@Body() registerDto: RegisterDto){
        return this.authService.register(registerDto);
    }

    @UseGuards(LoginThrottlerGuard)
     @Post('login')
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto);
    }

      @Post('refresh')
    refreshToken(@Body('refreshToken') refreshToken: string){
        return this.authService.refreshToken(refreshToken);
    }

    //Protected route

    //1. Current user route
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@CurrentUser() user:any){
        return user;
    }

    //Create Admin route
    @Post('create-admin')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    createAdmin(@Body() registerDto: RegisterDto){
        return this.authService.createAdmin(registerDto);
    }

}
