//@ts-nocheck
import { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';

const JWTSECRET = process.env.JWTSECRET!;
const prisma = new PrismaClient();

export default async function ProtectedRoute(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers.authorization;

    if(authToken != undefined) {
        const bearer = authToken.split(' ');
        const token = bearer[1];
        
        jwt.verify(token, JWTSECRET, async (err, data) => {
            if(err) {
                return res.status(401).json({ msg: "Token inválido." });
            }

            const user = await prisma.user.findUnique({
                where: {
                    uuid: data.uuid
                },
                include: {
                    user_items: true
                }
            });

            const newToken = jwt.sign(user, JWTSECRET);

            delete data.iat;
            delete user?.password;

            req.userLoggedIn = { ...user, token: newToken };

            if(req.userLoggedIn.status == 'INACTIVE') {
                return res.status(401).json({ msg: "Não autorizado." });
            }
            
            next();
        });

    } else {
        return res.status(401).json({ msg: "Não autorizado." });
    }

    
}