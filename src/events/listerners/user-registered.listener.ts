import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserRegisteredEvent } from "../user-events.service";



//event listener -> respond to the events emitted by eventemitter

@Injectable()
export class UserRegisteredListener{
    private readonly logger = new Logger(UserRegisteredListener.name);

    @OnEvent('user.registered') //method triggered whenever this event is emitted e.g sending mail
    handleUserRegisteredEvent(event: UserRegisteredEvent):void{
        const {user, timeStamp} = event

        //send verification email to user
        this.logger.log(
            `Welcome, ${user.email}! Your Account was created at ${timeStamp.toISOString()}`
        )

    }

}