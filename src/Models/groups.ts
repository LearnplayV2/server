import { PrismaClient } from "@prisma/client";
import type { GroupVisibility } from "../Types/groups";

const prisma = new PrismaClient();

class Model {

    public async getAll() {
        const query = await prisma.groups.findMany({
            skip: 0,
            take: 2
        });

        return query;
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