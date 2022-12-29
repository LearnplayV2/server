import type { Server } from "socket.io";
import Service from '../Services/socket';
import NotificationsModel from '../Models/notifications';
import type { Socket } from "socket.io";

export interface INotificationInput {
    id: number,
    title: string,
    description?: string,
}

class Controller {

    private socket : Server;

    constructor(io : Server) {
        this.socket = io;
        io.on('connection', (socket : Socket) => { 
            socket.on('broadcast', (data: any) => {
                console.log('broadcast', {data});
                this.emit('broadcast', data);
            });

            socket.on('newUser', (uuid: string) => {
                Service.addNewUser(uuid, socket.id);      
                console.log(`New user connected`, Service.getUsers());
            })
            
            socket.on('sendNotification', async ({uuid, message, description} : {uuid: string, message: string, description?: string}) => {
                const receiver = Service.getUser(uuid);
                const data = await NotificationsModel.save({userId: uuid, title: message, description });
                if(data) io.to(receiver?.socketId!).emit('getNotification', data);
            })

            socket.on('makeAllNotificationsRead', async(data : {uuid : string}) => {
                const receiver = Service.getUser(data.uuid);
                const rows = await NotificationsModel.makeAllRead(data.uuid);
                if(receiver?.socketId) {
                    io.to(receiver.socketId).emit('allNotificationsRead', rows);
                }
            })
            
            socket.on('disconnect', () => {
                Service.removeUser(socket.id);
            });
        });
    }

    public emit(key: string, data: INotificationInput) {
        this.socket.emit(key, data);
    }

}

const SocketController = (io : Server) => new Controller(io)

export default SocketController;