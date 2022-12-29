import { member_type, PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import type { RequestMember, RequestUser } from '../../Types/user';
import prisma_user_selection from "../../Utils/prismaUserSelection";

const model = new PrismaClient({log: ['query']});

export default async function MemberProtectedRoute(req: Request, res: Response, next: NextFunction) {
    const {userLoggedIn} = req as RequestUser;
    const { id } = req.params;

    if(id) {
        try {
            const data = await model.groups.findUnique({
                where: {
                    uuid: id.toString(),
                },
                include: {
                    members: {
                        include: {
                            user: true,
                        }
                    }
                },
            });

            // check if you are a member/staff of the group
            const isMember = data?.members?.some(member => {
                return member.userId === userLoggedIn.uuid && member.type == member_type.MEMBER;
            });
            const isStaff = data?.members?.some(member => {
                return member.userId === userLoggedIn.uuid && member.type == member_type.STAFF;
            });
            const isPrivate = data?.visibility == 'PRIVATE';

            const foundMember = await model.group_members.findFirst({
                where: {
                    userId: userLoggedIn.uuid
                },
                include: {
                    user: {
                        select: prisma_user_selection({avoid: ['password', 'status', 'email']})
                    }
                },
            });

            //@ts-ignore
            req.groupMember = foundMember;
            
            if(!isStaff) {
                if(isPrivate && !isMember) {
                    return res.status(401).json({msg: 'Você não tem permissões pra fazer isso'});
                } else {
                    return next();
                }
            } else {
                return next();
                    }

        } catch(err: any) {
            return res.status(err?.status ?? 500).json({msg: 'Ocorreu um erro do servidor'});
        }
    }    

    return res.status(401).json({ msg: "Você não é membro do grupo." });
    
}