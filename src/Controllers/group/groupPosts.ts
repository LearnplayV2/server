import { PrismaClient } from "@prisma/client";
import type { Request, Response } from "express";
import fileUpload from "express-fileupload";
import Media from "../../class/media";
import Paths from "../../class/paths";
import type { RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";
import { paginate } from "../../Utils/pagination";
import {v4 as uuid} from 'uuid';

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
                        groupId: id.toString()
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            ]);

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
            console.log(req.params)
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
                await model.group_posts.create({
                    data: {
                        content,
                        memberId: findMember.id,
                        groupId: id.toString()
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

    static async createAttachment(req: Request, res: Response) {
        console.log(req.files)
        const {id} = req.params;
        const {userLoggedIn} = req as RequestUser;
        let {attachments} = req.files as fileUpload.FileArray;
        try {
            if(!attachments) throw BasicError('Informe os anexos', 422);            

            const media = new Media(Paths.media.attachments.groupPosts);
            const mediaId = `${id}_fileId-${uuid()}`;

            if(!Array.isArray(attachments)) attachments = [attachments];
            if(attachments.length > 6) throw BasicError(`O limite de anexos é 6`, 422);
            
            const data = [];
            attachments.forEach((_, index) => {
                data.push({fileName: `${mediaId}_${index+1}`, groupId: id.toString()});
            });

            // save file in database first
            await Promise.all([
                await model.group_attachments.createMany({ data }),
                await media.saveFiles(mediaId, attachments)
            ]);

            res.status(201).end();
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    static async deleteAttachment(req: Request, res: Response) {

    }

}

export default GroupPostsController;