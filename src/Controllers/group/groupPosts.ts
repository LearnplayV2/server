import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import type { RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";

const model = new PrismaClient({log: ['query']});

class GroupPostsController {

    static async index(req: Request, res: Response) {
        console.log('hello world')
        try {
            const {id} = req.query;
            const {userLoggedIn} = req as RequestUser;

            if(!id) throw BasicError('Informe o id do grupo', 422);

            const data = await model.group_posts.findMany({
                where: {
                    id: id.toString()
                },
            });

            if(!data) throw BasicError('Nenhum post foi encontrado', 204);

            return res.json(data);
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
    
    static async create(req: Request, res: Response) {

    }

}

export default GroupPostsController;