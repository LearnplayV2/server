import type { Server } from "socket.io";
import type {User} from '../Types/user';
import Service from '../Services/socket';

class Controller {

    constructor(io : Server) {
        io.on('connection', (socket) => {
            socket.on('newUser', (email) => {
                Service.addNewUser(email, socket.id);          
            })

            socket.on('sendNotification', ({email, message} : {email: string, message: string}) => {
                const receiver = Service.getUser(email);
                io.to(receiver?.socketId!).emit('getNotification', message);
            })
            
            socket.on('disconnect', () => {
                Service.removeUser(socket.id);
            });
        });
    }

}

const SocketController = (io : Server) => new Controller(io)

export default SocketController;