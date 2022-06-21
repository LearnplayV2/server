import { PrismaClient } from "@prisma/client";
import type { User } from "../Types/user";
import { PrismaError } from "../Utils/errors";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class Model {

    public async create(data: User) {
        const {email, name, password} = data;

        try {
            const query = await prisma.user.create({ data: { email, name, password: bcrypt.hashSync(password, 10) } });
    
            return query;

        } catch(err : any) {
            throw new PrismaError(err, 422);
        }
        
    }

    public async login(email: string) {
        try {
            const query = await prisma.user.findUnique({where: {email}});

            return query;

        } catch(err : any) {
            throw new PrismaError(err, 422);
        }

    }

}

export default new Model();