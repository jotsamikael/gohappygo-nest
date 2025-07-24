import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "../auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

 constructor(private authService: AuthService){
     super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //vlidate jwt token and extract user info from it
           ignoreExpiration: false,
           secretOrKey: 'jwt_secret' 
        })
 }



    async validate(payload: any) {
        try {
            const user = await this.authService.getUserById(payload.sub)
            return {
                id: user.id,
                role: user.role.code,
                email: user.email,
                name: user.firstName

            }
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

}