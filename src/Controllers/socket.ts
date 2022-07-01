import type { Server } from "socket.io";
import type {User} from '../Types/user';
import Service from '../Services/socket';
import NotificationsModel from '../Models/notifications';
import type { Socket } from "socket.io";

class Controller {

    constructor(io : Server) {
        io.on('connection', (socket : Socket) => {
            socket.on('newUser', (uuid: string) => {
                Service.addNewUser(uuid, socket.id);      
                console.log(`New user connected`, Service.getUsers());
            })

            socket.on('sendNotification', ({uuid, message} : {uuid: string, message: string}) => {
                const receiver = Service.getUser(uuid);
                console.log('receiver', receiver, uuid);
                io.to(receiver?.socketId!).emit('getNotification', message);
                NotificationsModel.save({userId: uuid, title: message});
            })
            
            socket.on('disconnect', () => {
                Service.removeUser(socket.id);
            });
        });
    }

}

const SocketController = (io : Server) => new Controller(io)

export default SocketController;