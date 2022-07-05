import type { Request, Response } from "express";
import type { RequestUser, User } from "../Types/user";
import { CheckLogin, CheckRegistration } from "../Utils/userValidation";
import Model from '../Models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RequestError } from "request-error";
import multer from "multer";
import Service from '../Services/user';
import NotificationsModel from '../Models/notifications';
import type { RequestId } from "../Types/notifications";

const JWTSECRET = process.env.JWTSECRET;

class Controller {

    public async create(req: Request, res: Response) {
        const { email, password, name } = req.body as User;

        try {
            const user = { email, password, name };

            CheckRegistration(user);

            const query = await Model.create(user);

            // @ts-expect-error
            delete query.password;

            const token = jwt.sign(query, JWTSECRET!);

            res.status(201).json({ token });

        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }

    }

    public async login(req: Request, res: Response) {
        const { email, password } = req.body as User;

        
        try {
            CheckLogin({ email, password } as User);

            let query = await Model.login(email!);

            if (query?.status == 'INACTIVE') throw RequestError('Este usuário foi desativado', 401);
            if (query == null) throw RequestError('Usuário não encontrado.', 404);
            if (!bcrypt.compareSync(password!, query.password)) throw RequestError('Não foi possível fazer login');

            const token = jwt.sign(query, JWTSECRET!);

            // @ts-expect-error
            delete query.password;

            res.status(200).json({ token });


        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }

    }

    public async refresh(req: RequestUser, res: Response) {

        try {
            const query = await Model.findUserById(req.userLoggedIn.uuid!);

            const { userLoggedIn } = req as RequestUser;

            return res.json(userLoggedIn);

        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    public async setProfilePicture(req: RequestUser, res: Response) {
        const fileName = req.userLoggedIn.uuid;
        const upload = multer(Service.multerConfig('user', fileName)).single('file');

        upload(req, res, (err) => {
            if (!err) return res.status(200).json({ message: 'A foto de perfil foi alterada!', filename: `${fileName}.png` });

            return res.status(500).json(err);
        });
    }

    public async getProfilePicture(req: RequestUser, res: Response) {

        const { uuid } = req.params;

        const photo = await Service.getProfilePicture(uuid);

        res.writeHead(200, { 'Content-Type': 'image/png' });
        return res.end(photo);

    }

    public async getProfile(req: RequestUser, res: Response) {

        const { uuid } = req.params;

        const query = await Model.findUserById(uuid);

        //@ts-ignore
        delete query?.password;
        //@ts-ignore
        delete query?.email;

        return res.json(query);

    }

    public async getMembers(req: Request, res: Response) {

        try {   
            const query = await Model.getMembers();

            return res.json(query);

        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
        
    }

    public async getNotifications(req: RequestUser, res: Response) {
        try {
            const query = await NotificationsModel.getAll(req.userLoggedIn.uuid!);

            return res.json(query);

        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
    }

    public async getNotification(req: RequestId, res: Response) {
        
        try {

            const {id} = req.params;

            const query = await NotificationsModel.get(parseInt(id), req.userLoggedIn.uuid!);

            if(query == null) throw RequestError('Notificação não encontrada', 404);

            return res.json(query);
            
        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
    }

}

export default new Controller();