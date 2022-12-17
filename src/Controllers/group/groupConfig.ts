import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { BasicError } from "../../Utils/basicError";

const model = new PrismaClient({log: ['query']});

class GroupConfigController {
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.query;
            const {title, description } = req.body as any;

            if(!title) throw BasicError('Informe o título do grupo', 422);
            if(!id) throw BasicError('Informe o id do grupo', 422);

            await model.groups.update({
                where: {
                    uuid: id.toString(),
                },
                data: {
                    title,
                    description
                }
            });
            
            res.status(202).end();
        } catch (err: any) {
            console.log(err)
            res.status(err?.status ?? 500).json(err);
        }
    }
}

export default GroupConfigController;