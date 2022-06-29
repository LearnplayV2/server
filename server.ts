import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import IndexController from './src/Controllers/index';
import UserRoutes from './src/Routes/user';
import { Server } from 'socket.io';
import type { SocketRequest } from './src/Types/socket';
import SocketController from './src/Controllers/socket';

const app = express();

const corsConfig = {
    origin:  process.env.CLIENT_URL ? JSON.parse(process.env.CLIENT_URL) : '',
    optionsSuccessStatus: 200 
}

const io = new Server(process.env.SOCKET_PORT, {
    cors: corsConfig
});

SocketController(io);

app.use(express.urlencoded({ extended: true }));
app.use('/api/public/', express.static(__dirname + '/public'));
app.use(express.json());
app.use(cors(corsConfig));
app.use((req: SocketRequest, res: Response, next: NextFunction) => {
    req.io = io;
    next();
});

//* --- Basic Routes
app.get('/', IndexController.greetings);
app.use('/user', UserRoutes);

app.listen(process.env.API_PORT);