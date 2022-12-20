import fileUpload from "express-fileupload";
import Media from "../../class/media";
import Paths from "../../class/paths";
import {v4 as uuid} from 'uuid';
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { RequestMember, RequestUser } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";

const model = new PrismaClient({log: ['query']});

class GroupAttachments {

    static async create(req: Request, res: Response) {
        const {id} = req.params;
        const {userLoggedIn} = req as RequestUser;
        const {groupMember} = req as RequestMember;
        let {attachments} = req.files as fileUpload.FileArray;

        try {
            if(!attachments) throw BasicError('Informe os anexos', 422);            

            const media = new Media(Paths.media.attachments.groupPosts);
            const mediaId = `${id}_fileId-${uuid()}`;

            if(!Array.isArray(attachments)) attachments = [attachments];
            if(attachments.length > 6) throw BasicError(`O limite de anexos é 6`, 422);

            const data = [];
            attachments.forEach((_, index) => {
                data.push({fileName: `${mediaId}_${index+1}`, groupId: id.toString(), memberId: groupMember.id});
            });

            // save file in database first
            await Promise.all([
                await model.group_attachments.createMany({ data }),
                await media.saveFiles(mediaId, attachments)
            ]);

            res.status(201).end();
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    static async delete(req: Request, res: Response) {
        const {id} = req.params;
        const {userLoggedIn} = req as RequestUser;
        try {

            const mediaId = `${id}_fileId-${uuid()}`;

            // const data = [];
            // attachments.forEach((_, index) => {
            //     data.push({fileName: `${mediaId}_${index+1}`, groupId: id.toString()});
            // });

            // delete file in database first
            // await Promise.all([
            //     await model.group_attachments.createMany({ data }),
            //     await media.saveFiles(mediaId, attachments)
            // ]);

            res.status(201).end();
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
}

export default GroupAttachments;