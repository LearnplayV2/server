import { PrismaClient } from "@prisma/client";
import { RequestError } from "request-error";
import type { NotificationProps } from "../Types/notifications";

const prisma = new PrismaClient();

class Model {

    public async save(data: NotificationProps) {
        try {

            // check if notification title already exists
            const row = await prisma.notifications.findMany({
                where : {
                    userId: data.userId
                },
                orderBy: {
                    id: 'asc'
                }
            });

            if (row.length >= 1 && row[(row.length - 1)].title == data.title) return false;

            await prisma.notifications.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    description: data?.description,
                }
            });

            const rows = await this.getAll(data.userId);

            return rows;


        } catch (err: any) {
            throw RequestError(err, 422);
        }
    }

    public async makeAllRead(uuid: string) {
        await prisma.notifications.updateMany({
            where: {
                userId: uuid
            },
            data: {
                read: true
            }
        });

        const rows = await this.getAll(uuid);

        return rows;

    }

    public async toggleRead(id: number, userId: string) {

        const row = await prisma.notifications.findFirst({ where: { id, userId } });

        await prisma.notifications.updateMany({
            where: {
                id,
                userId
            },
            data: {
                read: !row?.read
            }
        });

        const result = await this.getAll(userId);

        return result;
        
    }

    public async getAll(uuid: string) {

        const query = await prisma.notifications.findMany({
            orderBy: {
                id: 'desc'
            },
            where: {
                userId: uuid
            }
        });

        return query;

    }

    public async get(id: number, userUuid: string) {

        const query = await prisma.notifications.findFirst({
            where: {
                id,
                userId: userUuid
            }
        })

        return query;

    }

}

export default new Model;