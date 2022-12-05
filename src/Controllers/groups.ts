import { Prisma, PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { RequestError } from 'request-error';
import Model, { ISearchGroup } from '../Models/groups';
import type { RequestUser } from '../Types/user';
import {BasicError} from '../Utils/basicError';

const model = new PrismaClient();

class Controller {
    async getAll(req: Request, res: Response) {
        const {query : receivedQuery} = req;
        try {
            let query = JSON.parse(JSON.stringify(receivedQuery));
            query = {
                ...query,
                page: query?.page ? parseInt(query?.page) : 1,
            } as ISearchGroup;
            const request = await Model.getAll(query);
            
            console.log(request)
            if(request.groups.length == 0) throw BasicError('Nenhum grupo foi criado ainda.', 404);

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
            await Model.delete({
                id,
                userId: userLoggedIn.uuid!,
            });

            res.json({ message: 'Grupo deletado com sucesso!' });
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    async myGroups(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        try {
            const page = parseInt(req.params.page);
            const response = await Model.myGroups({page, userId: userLoggedIn.uuid!, filter: req.params.filter});

            res.json(response);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    async setLinks(req: Request, res: Response) {
        const {userLoggedIn} = req as RequestUser;
        const { id } = req.query;
        try {
            const {title, url} = req.body as Prisma.group_linksCreateInput;
            
            if(id) {
                if(!title) throw RequestError('O título é obrigatório');
                if(!url) throw RequestError('A url é obrigatória');
                await model.group_links.upsert({
                    where: {
                        id: id.toString()
                    },
                    create: {
                        title, 
                        url, 
                        groupId: id.toString()
                    },
                    update: {
                        title,
                        url: url
                    }
                });

            } else {
                throw BasicError('Informe o id do grupo como query', 422);
            }
            
            res.status(201).end();

        } catch(err: any) {
            console.log(err)
            res.status(err?.status ?? 500).json(err);
        }        
    }

    async groupById(req: Request, res: Response) {
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
                            user: true,
                        }
                    },
                    staffs: {
                        include: {
                            staff: true
                        }
                    },
                  links: {
                    orderBy: {
                        id: 'desc'
                    }
                  }  
                },
            });

            if(!data) throw BasicError('Esse grupo não existe ou foi excluído.', 404);

            // check if you are a member/staff of the group
            const isMember = data?.members?.some(member => member.userId === userLoggedIn.uuid);
            const isStaff = data?.staffs?.some(staff => staff.staffId === userLoggedIn.uuid);

            let membersWithoutLoggedUser = data?.members?.filter(member => member.userId !== userLoggedIn.uuid);
            let staffWithoutLoggedUser = data?.staffs?.filter(staff => staff.staffId !== userLoggedIn.uuid);
            // rename staff to user and delete unnecessary data
            membersWithoutLoggedUser?.map(m => {
                 // @ts-expect-error
                 delete m.groupId; delete m.userId; delete m.user.password; delete m.user.email;
            });
            staffWithoutLoggedUser?.map(s => {
                // @ts-expect-error
                delete s.staffId; delete s.groupId; s['user'] = s.staff; delete s.staff.email; delete s.staff.password; delete s.staff;
            });

            const participation = isMember ? 'member' : isStaff ? 'staff' : undefined;

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

            const foundStaff = await model.group_staffs.findFirst({
                where: {
                    groupId: id,
                    staffId: userLoggedIn.uuid
                }
            });

            console.log(foundStaff)

            if(!foundMember && !foundStaff) {
                console.log('Entrou no grupo');
                await model.group_members.create({
                    data: {
                        groupId: id,
                        userId: userLoggedIn.uuid!
                    }
                });
                return res.status(200).send('Você entrou no grupo');
            } else if(foundStaff) {
                console.log('Você é staff');
                await model.groups.delete({
                    where: {
                        uuid: id
                    }
                });
                return res.status(200).send('Grupo excluído');
            } else if(foundMember) {
                console.log('Saiu do grupo');
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

export default new Controller();
