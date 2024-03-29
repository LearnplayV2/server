import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import type { RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";
import { paginate } from "../../Utils/pagination";
import prisma_user_selection from "../../Utils/prismaUserSelection";

const model = new PrismaClient({log: ['query']});

class GroupPostsController {

    static async index(req: Request, res: Response) {
        try {
            const {id} = req.params;
            if(!id) throw BasicError('Informe o id do grupo', 422);
            if(typeof req.query.perPage == 'undefined') req.query.perPage = '15';

            const params = {
                perPage: req.query.perPage ? parseInt(req.query.perPage.toString()) : 10,
                page: req.query.page ? parseInt(req.query.page.toString()) : 1,
                title: req.query.title ? req.query.title.toString() : '',
            };

            const {page, perPage, title} = params;

            const [totalItems, data] = await Promise.all([
                model.group_posts.count({
                    where: {
                        groupId: id.toString()
                    }
                }),
                model.group_posts.findMany({
                    skip: (perPage * (page - 1)),
                    take: perPage,
                    where: {
                        groupId: id.toString(),
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        attachments: true,
                        member: {
                            include: {
                                user: {
                                    select: prisma_user_selection({avoid: ['password', 'status', 'email']})
                                }
                            }
                        }
                    },
                })
            ]);

            console.log(totalItems)

            if(data.length == 0) throw BasicError('Nenhuma postagem foi encontrada.', 404);

            const pagination =  paginate({limit: perPage, page, count: {totalItems}});

            const response = {
                ...pagination,
                totalItems,
                data
            }

            return res.json(response);
            
        } catch(err: any) {
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
                    userId: userLoggedIn.uuid,
                    groupId: id.toString()
                }
            });

            if(findMember) {
                const data =  await model.group_posts.create({
                    data: {
                        content,
                        memberId: findMember.id,
                        groupId: id.toString(),
                    },
                    include: {
                        attachments: true
                    }
                });

                res.status(201).json({...data, message: "Post criado com sucesso!"});
            } else {
                throw BasicError('Membro não encontrado', 401);
            }
            
        } catch(err : any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

}

export default GroupPostsController;