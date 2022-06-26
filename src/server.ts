import express from 'express';
import cors from 'cors';
import IndexController from './Controllers/index';
import UserRoutes from './Routes/user';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin:  process.env.CLIENT_URL ? JSON.parse(process.env.CLIENT_URL) : '',
    optionsSuccessStatus: 200 
}));

//* --- Basic Routes

app.get('/', IndexController.greetings);
app.use('/user', UserRoutes);

app.listen(process.env.API_PORT);