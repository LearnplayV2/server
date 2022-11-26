import { PrismaClient } from "@prisma/client";
import { RequestError } from "request-error";
import type { GroupVisibility } from "../Types/groups";
import {paginate} from '../Utils/pagination';

const prisma = new PrismaClient();

const limitPerPage = 4; 

export interface ISearchGroup {
    page: number;
    title?: string;
}

class Model {

    public async getAll(props: ISearchGroup) {
        const {page, title} = props;

        const queryParams = {
            title : {
                contains: title
            }
        };

        const totalItems = await prisma.groups.count({
            where: {
                visibility: 'PUBLIC',
                ...queryParams
            }
        });

        const query = await prisma.groups.findMany({
            skip: (limitPerPage * (page - 1)),
            take: limitPerPage,
            where: {
                visibility: 'PUBLIC',
                ...queryParams
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const pagination = paginate({limit: limitPerPage, page, count: {totalItems}});
        
        return {
            ...pagination,
            totalItems,
            groups: query,
            query: props
        };
    }

    public async create(data : {userId: string, title: string, description?: string, visibility?: GroupVisibility}) {

        const group = await prisma.groups.create({ 
            data: {
                title: data.title,
                description: data.description,
                visibility: data.visibility
            }
        });
        
        const staff = await prisma.group_staffs.create({
            data: {
                groupId: group.uuid,
                staffId: data.userId
            }
         });

        return [group, staff];
    }

    public async delete(data: {id: string, userId: string}) {
        try {

            const find_staff = await prisma.group_staffs.findFirst({
                where: {
                    groupId: data.id,
                    AND: {
                        staffId: data.userId
                    }
                }
            });
    
            if(find_staff == null) throw new Error('Você não tem permissões pra fazer isso');
            
            // then delete groups and relations
            Promise.all([
                prisma.group_members.deleteMany({ where: { groupId: data.id } }),
                prisma.group_staffs.deleteMany({where: {groupId: data.id}}),
                prisma.groups.delete({where: {uuid: data.id}})
            ]);
            
        } catch(err: any) {
            throw RequestError(err.message ?? 'Ocorreu um erro inesperado');
        }
        
    } 
    
    public async myGroups(data: {userId: string, page: number, filter?: string}) {
        const totalItems = await prisma.groups.count({
            where: {
                title: {
                    contains: data.filter
                },
                staffs: {
                    some: {
                        staffId: data.userId
                    }
                }
            }
        });

        const query = await prisma.groups.findMany({
            skip: (limitPerPage * (data.page - 1)),
            take: limitPerPage,
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                title: {
                    contains: data.filter
                },
                staffs: {
                    some: {
                        staffId: data.userId
                    }
                }
            },
            include: {
                staffs: {
                    include: {
                        staff: {
                            select: {
                                name: true,
                            }
                        }
                    },
                }
            }
        });

        const pagination = paginate({limit: limitPerPage, page: data.page, count: {totalItems}});

        return {
            ...pagination,
            totalItems,
            groups: query
        };
    }
    
}

export default new Model;