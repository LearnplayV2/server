import { PrismaClient } from '@prisma/client';
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

            await Model.create({
                title,
                userId: userLoggedIn.uuid!,
                visibility: visibility,
                description,
            });

            res.json({ message: 'Grupo criado com sucesso!' });
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

            // check if you are a member/staff of the group
            const isMember = data?.members?.some(member => member.userId === userLoggedIn.uuid);
            const isStaff = data?.staffs?.some(staff => staff.staffId === userLoggedIn.uuid);
            const isPrivate = data?.visibility == 'PRIVATE';
            console.log({
                isMember,
                isStaff,
                isPrivate
            })
            if(!isStaff) {
                if(isPrivate && !isMember) throw RequestError('Você não tem permissões pra fazer isso');
            }

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

            const parsedData = {
                uuid: data?.uuid,
                title: data?.title,
                participation: {
                    isMember,
                    isStaff,
                },
                members: membersWithoutLoggedUser,
                staffs: staffWithoutLoggedUser,
                ...data
            };

            res.json(parsedData);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
    
}

export default new Controller();
