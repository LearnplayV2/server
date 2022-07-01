import { PrismaClient } from "@prisma/client";
import { RequestError } from "request-error";
import type { NotificationProps } from "../Types/notifications";

const prisma = new PrismaClient();

class Model {

    public async save(data: NotificationProps) {
        try {

            // check if notification title already exists
            // const row = await prisma.notifications.findMany({
            //     where: {
            //         title : data.title
            //     },
            //     orderBy: {
            //         id: 'desc'
            //     },
            //     take: 1
            // });

            // if(row.length === 0)
            const query = await prisma.notifications.create({
                data: {
                    userId: data.userId,
                    title: data.title,
                    description: data?.description,
                }
            });

            return query;


        } catch (err: any) {
            throw RequestError(err, 422);
        }
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

}

export default new Model;