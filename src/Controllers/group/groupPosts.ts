import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import type { RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";
import { paginate } from "../../Utils/pagination";

const model = new PrismaClient({log: ['query']});

class GroupPostsController {

    static async index(req: Request, res: Response) {
        try {
            const {id} = req.params;
            if(!id) throw BasicError('Informe o id do grupo', 422);

            const params = {
                perPage: req.query.perPage ? parseInt(req.query.perPage.toString()) : 10,
                page: req.query.page ? parseInt(req.query.page.toString()) : 1,
                title: req.query.title ? req.query.title.toString() : '',
            };

            const {page, perPage, title} = params;

            const [totalItems, data] = await Promise.all([
                model.group_posts.count({
                    where: {
                        id: id.toString()
                    }
                }),
                model.group_posts.findMany({
                    skip: (params.perPage * (page - 1)),
                    take: perPage,
                    where: {
                        id: id.toString()
                    },
                })
            ]);

            if(data.length == 0) throw BasicError('Nenhum post foi encontrado', 204);

            const pagination =  paginate({limit: perPage, page, count: {totalItems}});

            return res.json(pagination);
            
        } catch(err: any) {
            console.log(err)
            res.status(err?.status ?? 500).json(err);
        }
    }
    
    static async create(req: Request, res: Response) {
        try {
            const {id} = req.params;
            const {userLoggedIn} = req as RequestUser;

            if(!id) throw BasicError('Informe o id do grupo', 422);

            const {content} = req.body;
            if(!content) throw BasicError('Informe o conteúdo do post', 422);

            const findMember = await model.group_members.findFirst({
                where: {
                    userId: userLoggedIn.uuid!.toString(),
                }
            });

            if(findMember) {
                await model.group_posts.create({
                    data: {
                        content,
                        memberId: findMember.id
                    }
                });

                res.send("Post criado com sucesso!");
            } else {
                throw BasicError('Membro não encontrado', 401);
            }
            
        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

}

export default GroupPostsController;