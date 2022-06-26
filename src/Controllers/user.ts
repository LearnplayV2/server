import type { Request, Response } from "express";
import type { User } from "../Types/user";
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

            const query = await Model.login(email);
            
            if(query == null) throw RequestError('Usuário não encontrado.', 404);
            if(!bcrypt.compareSync(password, query.password)) throw RequestError('Não foi possível fazer login');

            const token = jwt.sign(query, JWTSECRET!);

            res.status(200).json({token});
    

        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }

    }
    
}

export default new Controller();