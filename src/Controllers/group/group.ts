import { member_type, PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { RequestError } from 'request-error';
import Model, { ISearchGroup } from '../../Models/groups';
import type { RequestUser } from '../../Types/user';
import {BasicError} from '../../Utils/basicError';
import prisma_user_selection from '../../Utils/prismaUserSelection';

const model = new PrismaClient({log: ['query']});

class GroupController {

    async index(req: Request, res: Response) {
        const {query : receivedQuery} = req;
        try {
            let query = JSON.parse(JSON.stringify(receivedQuery));
            query = {
                ...query,
                page: query?.page ? parseInt(query?.page) : 1,
            } as ISearchGroup;
            const request = await Model.getAll(query);
            
            if(request.groups.length == 0) throw BasicError('Nenhum grupo foi encontrado.', 404);

            res.json(request);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { title, visibility, description } = req.body;
            const {userLoggedIn} = req as RequestUser;

            if(title.length > 31) throw RequestError('O título deve conter no máximo 31 caracteres');
            if(title.length < 4) throw RequestError('O título deve conter no mínimo 4 caracteres');
            if(description.length > 400) throw RequestError('A descrição deve conter no máximo 400 caracteres');

            const data = await Model.create({
                title,
                userId: userLoggedIn.uuid!,
                visibility: visibility,
                description,
            });

            //@ts-ignore
            const groupId : any = data[0]?.uuid;

            res.json({ message: 'Grupo criado com sucesso!', groupId });
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    async delete(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        const { id } = req.params;
        try {
            const find_staff = await model.group_members.findFirst({
                where: {
                    groupId: id,
                    AND: {
                        userId: userLoggedIn.uuid,
                    },
                    type: member_type.STAFF
                }
            });
    
            if(find_staff == null) throw new Error('Você não tem permissões pra fazer isso');

            await model.groups.delete({where: {uuid: id}});

            res.json({ message: 'Grupo deletado com sucesso!' });
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    async showByFilter(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            const page = parseInt(req.params.page);
            const response = await Model.myGroups({page, userId: userLoggedIn.uuid!, filter: req.params.filter});

            res.json(response);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    
    async show(req: Request, res: Response) {
        const { id } = req.params;
        const {userLoggedIn} = req as RequestUser;
        try {
            const data = await model.groups.findUnique({
                where: {
                    uuid: id,
                },
                include: {
                    members: {
                        include: {
                            user: {
                                select: prisma_user_selection({avoid: ['password', 'status', 'email']})
                            },
                        },
                    },
                  links: {
                    orderBy: {
                        id: 'desc'
                    }
                  }  
                },
            });

            if(!data) throw BasicError('Esse grupo não existe ou foi excluído.', 404);
            
            let membersWithoutLoggedUser = data?.members?.filter(member => member.userId !== userLoggedIn.uuid && member.type === member_type.MEMBER);
            let staffWithoutLoggedUser = data?.members?.filter(member => member.userId !== userLoggedIn.uuid  && member.type === member_type.STAFF);

            const participation = data.members.find(member => member.userId === userLoggedIn.uuid)?.type;

            const parsedData = {
                ...data,
                uuid: data?.uuid,
                title: data?.title,
                participation,
                members: membersWithoutLoggedUser,
                staffs: staffWithoutLoggedUser,
            };

            res.json(parsedData);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }

    }

    async joinOrExitGroup(req: Request, res: Response) {
        try {
            const {userLoggedIn} = req as RequestUser;
            const { id } = req.body;
            if(typeof id == 'undefined') throw BasicError('Informe o id do grupo', 422);
            if(typeof userLoggedIn == 'undefined') throw BasicError('Usuário não conectado', 401);

            // found group or throw error
            await model.groups.findUniqueOrThrow({
                where: {
                    uuid: id,                    
                }
            });
            
            const foundMember = await model.group_members.findFirst({
                where: {
                    groupId: id,
                    userId: userLoggedIn.uuid
                }
            });

            const foundStaff = await model.group_members.findFirst({
                where: {
                    groupId: id,
                    userId: userLoggedIn.uuid,
                    type: member_type.STAFF
                }
            });

            if(!foundMember && !foundStaff) {
                await model.group_members.create({
                    data: {
                        groupId: id,
                        userId: userLoggedIn.uuid!
                    }
                });
                return res.status(200).send('Você entrou no grupo');
            } else if(foundStaff) {
                await model.groups.delete({
                    where: {
                        uuid: id
                    }
                });
                return res.status(200).send('Grupo excluído');
            } else if(foundMember) {
                await model.group_members.delete({
                    where: {
                        id: foundMember.id
                    }
                });
                return res.status(200).send('Você saiu do grupo');
            }

        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
    
}

export default new GroupController();
