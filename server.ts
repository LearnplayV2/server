import express, { NextFunction, Response } from 'express';
import cors from 'cors';
import IndexController from './src/Controllers/index';
import UserRoutes from './src/Routes/user';
import NotificationRoutes from './src/Routes/notifications';
import GroupRoutes from './src/Routes/groups';
import { Server } from 'socket.io';
import SocketController from './src/Controllers/socket';
import fileUpload from 'express-fileupload';
import AttachmentsController from './src/Controllers/attachments';

const app = express();

const corsConfig = {
    origin:  '*',
    optionsSuccessStatus: 200 
}

const io = new Server(process.env.SOCKET_PORT as any, {
    cors: corsConfig
});

SocketController(io);

app.use(express.urlencoded({ extended: true }));
app.use('/api/public/', express.static(__dirname + '/public'));
app.use(express.json({limit: '500mb'}));
app.use(fileUpload());
app.use(cors(corsConfig));
app.use((req: any, res: Response, next: NextFunction) => {
    req.io = io;
    next();
});

//* --- Basic Routes
app.get('/', IndexController.greetings);
app.get('/attachments', AttachmentsController.show);
app.get('/debug', IndexController.debug);
app.use('/user', UserRoutes);
app.use('/user', NotificationRoutes);
app.use('/group', GroupRoutes);

app.listen(process.env.API_PORT);