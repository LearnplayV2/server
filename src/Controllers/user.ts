import type { Request, Response } from "express";
import type { RequestUser, User } from "../Types/user";
import { CheckLogin, CheckRegistration } from "../Utils/userValidation";
import Model from '../Models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RequestError } from "request-error";

const JWTSECRET = process.env.JWTSECRET;

class Controller {

    public async create(req: Request, res: Response) {
        const {email, password, name} = req.body as User;
        
        try {
            const user = {email, password, name};

            CheckRegistration(user);

            const query = await Model.create(user);

            // @ts-expect-error
            delete query.password;

            const token = jwt.sign(query, JWTSECRET!);

            res.status(201).json({token});

        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }
        
    }

    public async login(req: Request, res: Response) {
        const {email, password} = req.body as User;

        try {
            CheckLogin({email, password} as User);

            let query = await Model.login(email);
            
            if(query == null) throw RequestError('Usuário não encontrado.', 404);
            if(!bcrypt.compareSync(password, query.password)) throw RequestError('Não foi possível fazer login');

            const token = jwt.sign(query, JWTSECRET!);

            // @ts-expect-error
            delete query.password;

            res.status(200).json({token});
    

        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }

    }

    public async refresh(req: RequestUser, res: Response) {

        try {
            const query = await Model.findUserById(req.userLoggedIn.uuid!);

            const {userLoggedIn} = req;

            return res.json({msg: 'Usuário autenticado com sucesso!', user: userLoggedIn});
            
        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }
    }    

}

export default new Controller();