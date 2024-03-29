import { member_type, PrismaClient } from "@prisma/client";
import type { RequestUser } from '../../Types/user';
import type { NextFunction, Request, Response } from "express";
import prisma_user_selection from "../../Utils/prismaUserSelection";

const JWTSECRET = process.env.JWTSECRET!;
const prisma = new PrismaClient();

export default async function StaffProtectedRoute(req: Request, res: Response, next: NextFunction) {
    const {userLoggedIn} = req as RequestUser;
    const { id } = req.query;
    
    if(id) {
        const query = await prisma.group_members.findFirst({
            where: {
                groupId: id.toString(),
                userId: userLoggedIn.uuid,
                type: member_type.STAFF
            },
            include: {
                user: {
                    select: prisma_user_selection({avoid: ['password', 'status', 'email']})
                }
            },
        });
        
        if(query) {

            //@ts-ignore
            req.group = {};
            //@ts-ignore
            req.group.member = query;
            
            return next();
        }
    }    

    return res.status(401).json({ msg: "Você não é staff do grupo." });
    
}