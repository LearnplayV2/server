import { PrismaClient } from "@prisma/client";
import type { User } from "../Types/user";
import bcrypt from 'bcrypt';
import { RequestError } from "request-error";

const prisma = new PrismaClient();

class Model {

    public async create(data: User) {
        const {email, name, password} = data;

        try {
            if( !email || !name || !password) throw RequestError('Não foi possível criar usuário', 422);
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
            const query = await prisma.user.findUnique( { where: {email}, } );

            return query;

        } catch(err : any) {
            throw RequestError(err, 422);
        }

    }

    public async findUserById(uuid: string) {
        try {

            const query = await prisma.user.findFirst( { where: {uuid}, include: {user_items: true}} );

            return query;

        } catch(err : any) {
            throw RequestError('Usuário não encontrado', 404);
        }
    }

    public async getMembers(uuid: string) {
        try {
            const query = await prisma.user.findMany({
                skip: 0,
                take: 5,
                where: {
                    status: 'ACTIVE',
                    NOT: {
                        uuid
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    uuid: true,
                    name: true,
                    createdAt: true,
                    user_items: true
                },
            });

            return query;
        } catch(err : any) {
            throw RequestError(err, 422);
        }
    }

    public async setProfilePicture(userId: string, base64Photo: string) {
        try {
            await prisma.user_items.upsert(
                {
                    where: {
                        userId: userId,
                    },
                    update: {
                        photo: base64Photo
                    },
                    create: {
                        userId: userId,
                        photo: base64Photo
                    }
                }
            );

        } catch(err: any) {
            throw RequestError(err, 422);
        }
    }

}

export default new Model();