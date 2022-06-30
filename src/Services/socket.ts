import type {User} from '../Types/user';

class Service {

    private onlineUsers : User[] = [];

    public addNewUser = (email: string, socketId: string) => {
        !this.onlineUsers.some((user : User) => user.email === email) &&
        this.onlineUsers.push({ email, socketId });
    }

    public removeUser = (socketId : string) => {
        this.onlineUsers = this.onlineUsers.filter((user : User) => user.socketId !== socketId);
    }

    public getUser = (email : string) => {
        return this.onlineUsers.find((user : User) => user.email === email);
    }

    public getUsers = () => {
        return this.onlineUsers;
    }

}

export default new Service;