import { PrismaClient } from "@prisma/client";
import type { GroupVisibility } from "../Types/groups";

const prisma = new PrismaClient();

class Model {

    public async getAll({page} : {page: number}) {

        const limit = 2;
        const totalPages = Math.floor(limit/page);
        
        const query = await prisma.groups.findMany({
            skip: page,
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            page: page,
            totalPages,
            hasNextpage: page < totalPages,
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
    
}

export default new Model;