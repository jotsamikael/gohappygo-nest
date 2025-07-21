import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    //injecting service from another module
    //Hello module must export helloservice
    //User module must import hello module 
    constructor(){

    }
    getAllUsers(){
        return [
            {
                id: 1,
                name: "Atanga"
            },
             {
                id: 2,
                name: "Bessala"
            },
             {
                id: 3,
                name: "Cheick"
            },
             {
                id: 4,
                name: "Dogmo"
            }
        ]
    }

    getUserById(id: number){
        const user = this.getAllUsers().find(user=>user.id === id);
        return user;
    }

}

