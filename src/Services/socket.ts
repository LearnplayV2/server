import type {User} from '../Types/user';

class Service {

    private onlineUsers : User[] = [];

    public addNewUser = (uuid: string, socketId: string) => {
        !this.onlineUsers.some((user : User) => user.uuid === uuid) &&
        this.onlineUsers.push({ uuid, socketId });
    }

    public removeUser = (socketId : string) => {
        this.onlineUsers = this.onlineUsers.filter((user : User) => user.socketId !== socketId);
    }

    public getUser = (uuid : string) => {
        return this.onlineUsers.find((user : User) => user.uuid === uuid);
    }

    public getUsers = () => {
        return this.onlineUsers;
    }

}

export default new Service;