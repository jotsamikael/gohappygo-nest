import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEntity } from 'src/user/user.entity';

export interface UserRegisteredEvent {
  user: {
    id: number;
    email: string;
    name: string;
  };
  timeStamp: Date;
}

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  //emit a uer registered event
  emitUserRegistered(user: UserEntity): void {
    const userRegisteredEvent: UserRegisteredEvent = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      timeStamp: new Date(),
    };
    
    //event name and event data are emitted
    this.eventEmitter.emit('user.registered', userRegisteredEvent);
  }
}
