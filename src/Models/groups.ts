import { PrismaClient } from "@prisma/client";
import { RequestError } from "request-error";
import type { GroupVisibility } from "../Types/groups";

const prisma = new PrismaClient();

class Model {

    public async getAll({page} : {page: number}) {

        const limit = 2;
        const totalPages = Math.floor(limit/page);

        const query = await prisma.groups.findMany({
            skip: (limit * (page - 1)),
            take: limit,
            where: {
                visibility: 'PUBLIC'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            page: page,
            totalPages: totalPages - 1,
            hasNextPage: (totalPages - 1) > 0,
            groups: query
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
        console.log(data.userId);

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
            
            // then delete members, staffs & users
            Promise.all([
                prisma.group_members.deleteMany({ where: { groupId: find_staff.groupId } }),
                prisma.group_staffs.deleteMany({where: {groupId: find_staff.groupId}}),
                prisma.groups.delete({where: {uuid: find_staff.groupId}})
            ]);
            
        } catch(err: any) {
            throw RequestError(err.message ?? 'Ocorreu um erro inesperado');
        }
        
    } 
    
}

export default new Model;