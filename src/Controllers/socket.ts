import type { Server } from "socket.io";
import type {User} from '../Types/user';
import SocketService from '../Services/socket';

class Controller {

    private onlineUsers : User[] = [];

    constructor(io : Server) {
        io.on('connection', (socket) => {
            socket.on('newUser', (email) => {
                SocketService.addNewUser(email, socket.id);                
            })
            console.log('alguém se conectou');
        });
    }

}

const SocketController = (io : Server) => new Controller(io)

export default SocketController;