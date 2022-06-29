import type {User} from '../Types/user';

class Service {

    private onlineUsers : User[] = [];

    public addNewUser = (email: string, socketId: string) => {
        !this.onlineUsers.some((user : User) => user.email === email) &&
        this.onlineUsers.push({ email, socketId });
    }

    public getUsers = () => {
        return this.onlineUsers;
    }

}

export default new Service;