import type { Request, Response } from "express";
import type { RequestUser, User } from "../Types/user";
import { CheckLogin, CheckRegistration } from "../Utils/userValidation";
import Model from '../Models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RequestError } from "request-error";
import NotificationsModel from '../Models/notifications';
import type { RequestId } from "../Types/notifications";
import Media from "../class/media";
import Paths from "../class/paths";

const JWTSECRET = process.env.JWTSECRET;

class Controller {

    public async create(req: Request, res: Response) {
        const { email, password, name } = req.body as User;

        try {
            const user = { email, password, name };

            CheckRegistration(user);

            const query = await Model.create(user);

            // @ts-ignore
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

            // @ts-ignore
            delete query.password;

            res.status(200).json({ token });


        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }

    }

    public async refresh(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;

        try {
            if(userLoggedIn.uuid) {
                await Model.findUserById(userLoggedIn.uuid);
                return res.json(userLoggedIn);
            }

            throw RequestError('Id de usuário não encontrado', 422);

        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    public async setProfilePicture(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            if(req.body.base64File == undefined) throw RequestError('Ocorreu um erro do servidor', 500);
            if(!userLoggedIn.uuid) throw RequestError('Usuário não encontrado', 422);
            else {
                // save file in local storage
                await new Media(Paths.media.attachments.profile).saveFiles(userLoggedIn.uuid, req.body.base64File);
            }
            
            return res.status(200).json();
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
       
    }

    public async getUserItems(req: Request, res: Response) {
        try {
            const {userLoggedIn} = req as RequestUser;
            
            if(!userLoggedIn.uuid) throw RequestError('Ocorreu um erro do servidor', 500);

            const userItems = await new Media(Paths.media.attachments.profile).getBase64File(userLoggedIn.uuid);
            
            return res.status(200).json({photo: userItems });

        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
        
    }

    public async getProfile(req: Request, res: Response) {
        const {} = req as RequestUser;
        const { uuid } = req.params;

        const query = await Model.findUserById(uuid);

        //@ts-ignore
        delete query?.password;
        //@ts-ignore
        delete query?.email;

        return res.json(query);

    }

    public async getMembers(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;

        try {   
            if(!userLoggedIn.uuid) throw RequestError('id de usuário não encontrado', 422);
            const query = await Model.getMembers(userLoggedIn.uuid);

            return res.json(query);

        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
        
    }

    public async getNotifications(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            if(!userLoggedIn.uuid) throw RequestError('id de usuário não encontrado', 422);
            const query = await NotificationsModel.getAll(userLoggedIn.uuid);

            return res.json(query);

        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
    }

    public async getNotification(req: Request, res: Response) {
        const { userLoggedIn } = req as RequestId;
        try {

            const {id} = req.params;

            if(!userLoggedIn.uuid) throw RequestError('id de usuário não encontrado', 422);
            const query = await NotificationsModel.get(parseInt(id), userLoggedIn.uuid);

            if(query == null) throw RequestError('Notificação não encontrada', 404);

            return res.json(query);
            
        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
    }

    public async toggleNotification(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            const {id} = req.params;

            if(!userLoggedIn.uuid) throw RequestError('id de usuário não encontrado', 422);
            const query = await NotificationsModel.toggleRead(parseInt(id), userLoggedIn.uuid);

            return res.json(query);
            
        }catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
        
    }

    public async makeAllNotificationRead(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            if(!userLoggedIn.uuid) throw RequestError('id de usuário não encontrado', 422);
            const query = await NotificationsModel.makeAllRead(userLoggedIn.uuid);

            return res.json(query);

        } catch(err : any) {
            return res.status(err?.status ?? 500).json(err);
        }
    }

}

export default new Controller();