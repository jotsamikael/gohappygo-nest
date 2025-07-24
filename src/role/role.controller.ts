import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { UserRoleEntity } from './userRole.entity';
import { CreateUserRoleDto } from './dto/createUserRole.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { UserEntity, UserRole } from 'src/user/user.entity';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { FindRolesQueryDto } from './dto/FindRolesQuery.dto';
import { UpdateUserRoleDto } from './dto/updateUserRole.dto';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';

@Controller('role')
export class RoleController {

    constructor(private readonly roleService: RoleService){

    }

    @Post('')
    @HttpCode(HttpStatus.CREATED)
    async createPost(@Body() createUserRoleDto:CreateUserRoleDto, @CurrentUser() user: any ): Promise<UserRoleEntity>{    
    return this.roleService.createUserRole(createUserRoleDto, user);
    }

    @Get()
   async getAllRoles(
    @Query() query : FindRolesQueryDto
   ): Promise<PaginatedResponse<UserRoleEntity>>{
       return this.roleService.getAllRoles(query);
    }

    @Put(':id')
    async updatePost(@Param('id', ParseIntPipe) id: number, @Body() updateUserRoleDto:UpdateUserRoleDto, @CurrentUser() user: any ){
        return this.roleService.updateUserRole(id, updateUserRoleDto, user)
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number):Promise<void>{
        this.roleService.deleteRole(id)
    }
}
