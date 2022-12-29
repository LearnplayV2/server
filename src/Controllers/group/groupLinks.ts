import { Prisma, PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import { BasicError } from "../../Utils/basicError";

const model = new PrismaClient({log: ['query']});

class GroupLinksController {

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.query;
            if(id) {
                const links = req.body as Prisma.group_linksCreateInput[];
                const validate = !links.some(link => (link.title === '' || link.url === '' || typeof link.title === 'undefined' || typeof link.url === 'undefined'));
                if(!validate) throw BasicError('O título e o link não podem ser nulos', 422);

                const data = links.map(link => {
                    return {
                        groupId: id.toString(),
                        title: link.title,
                        url: link.url,
                    }
                });

                const [_, _a, query] = await Promise.all([
                    await model.group_links.deleteMany({
                        where: {
                            groupId: id.toString()
                        }
                    }),
                    await model.group_links.createMany({data }),
                    await model.group_links.findMany({where: {groupId: id.toString() } })
                ]);
                
                return res.status(201).json(query);

            } else {
                throw BasicError('Informe o id do grupo como query', 422);
            }

        } catch(err: any) {
            console.log(err)
            res.status(err?.status ?? 500).json(err);
        }        
    }
}

export default GroupLinksController;