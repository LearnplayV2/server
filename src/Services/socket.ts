import type { Server } from "socket.io";
import type {User} from '../Types/user';

class Service {

    private onlineUsers : User[] = [];

    constructor(io : Server) {
        io.on('connection', (socket) => {
            socket.on('newUser', ({email} : User) => {
                this.addNewUser(email!, socket.id);
                console.log(this.getUsers())
            })
            console.log('alguém se conectou');
        });
    }

    public addNewUser = (email: string, socketId: string) => {
        !this.onlineUsers.some((user : User) => user.email === email) &&
        this.onlineUsers.push({ email, socketId });
    }

    public getUsers = () => {
        return this.onlineUsers;
    }

}

const SocketService = (io : Server) => new Service(io)

export default SocketService;