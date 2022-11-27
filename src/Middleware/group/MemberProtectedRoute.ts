import { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { RequestUser } from '../../Types/user';

const JWTSECRET = process.env.JWTSECRET!;
const prisma = new PrismaClient();

export default async function MemberProtectedRoute(req: Request, res: Response, next: NextFunction) {
    const {userLoggedIn} = req as RequestUser;
    const { id } = req.params;

    console.log('id', id)
    
    if(id) {
        const data = await prisma.groups.findUnique({
            where: {
                uuid: id.toString(),
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
                }
            },
        });

        // check if you are a member/staff of the group
        const isMember = data?.members?.some(member => member.userId === userLoggedIn.uuid);
        const isStaff = data?.staffs?.some(staff => staff.staffId === userLoggedIn.uuid);
        const isPrivate = data?.visibility == 'PRIVATE';

        if(!isStaff) {
            if(isPrivate && !isMember) {
                return res.status(401).json({msg: 'Você não tem permissões pra fazer isso'});
            } else {
                return next();
            }
        } else {
            return next();
        }
    }    

    return res.status(401).json({ msg: "Você não é membro do grupo." });
    
}