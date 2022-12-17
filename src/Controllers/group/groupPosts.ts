import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import type { RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";

const model = new PrismaClient({log: ['query']});

class GroupPostsController {

    static async index(req: Request, res: Response) {
        try {
            const {id} = req.query;
            const {content} = req.body;
            const {userLoggedIn} = req as RequestUser;

            if(!id) throw BasicError('Informe o id do grupo', 422);
            if(!content) throw BasicError('Informe o conteúdo do post', 422);
            // todo
            // if(!)

            // await model.group_posts.create({
            //     where: {
            //         id: id.toString()
            //     },
            //     data: {

            //         content,

            //     }
            // });

            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
    
    static async create(req: Request, res: Response) {

    }

}

export default GroupPostsController;