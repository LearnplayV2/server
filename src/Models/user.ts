import { PrismaClient } from "@prisma/client";
import type { User } from "../Types/user";
import bcrypt from 'bcrypt';
import { RequestError } from "request-error";

const prisma = new PrismaClient();

class Model {

    public async create(data: User) {
        const {email, name, password} = data;

        try {
            const query = await prisma.user.create({ data: { email, name, password: bcrypt.hashSync(password, 10) } });
    
            return query;

        } catch(err : any) {
            let error = err;
            switch (err.meta.target) {
                case 'user_email_key':
                    error = 'Este e-mail já foi cadastrado';
                break;
            }
            throw RequestError(error, 422);
        }
        
    }

    public async login(email: string) {
        try {
            const query = await prisma.user.findUnique({where: {email}});

            return query;

        } catch(err : any) {
            throw RequestError(err, 422);
        }

    }

}

export default new Model();