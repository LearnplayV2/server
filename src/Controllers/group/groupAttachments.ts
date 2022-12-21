import fileUpload from "express-fileupload";
import Paths from "../../class/paths";
import {v4 as uuid} from 'uuid';
import { file_type, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { RequestMember } from "../../Types/user";
import { BasicError } from "../../Utils/basicError";
import Attachment from "../../class/attachment";

const model = new PrismaClient({log: ['query']});

class GroupAttachments {

    static async create(req: Request, res: Response) {
        const {id} = req.params;
        const {groupMember} = req as RequestMember;
        
        try {
            let {attachments} = req.files as fileUpload.FileArray;
            const {postId, filesType} = req.body;
            if(!attachments) throw BasicError('Informe os anexos', 422);            

            const media = new Attachment(Paths.media.attachments.groupPosts);
            const mediaId = `${id}_fileId-${uuid()}`;

            if(!Array.isArray(attachments)) attachments = [attachments];
            if(attachments.length > 6) throw BasicError(`O limite de anexos é 6`, 422);
            
            const data = [];

            attachments.forEach((attachment, index) => {
                const ext = attachment.name.split('.').pop();
                data.push({fileName: `${mediaId}_${index+1}.${ext}`, postId: postId, groupId: id.toString(), memberId: groupMember.id, fileType: filesType});
            });
            
            // save file in database first
            const [_, attached, __] = await Promise.all([
                await model.group_attachments.createMany({ data }),
                await model.group_attachments.findMany({where: { groupId: id, memberId: groupMember.id, fileName: {contains: mediaId}}, select: {id: true, fileName: true, createdAt: true, updatedAt: true}}),
                await media.saveFiles(mediaId, attachments)
            ]);

            res.status(201).json({attached});
            
        } catch(err: any) {
            console.log(err);
            res.status(err?.status ?? 500).json(err);
        }
    }

    static async delete(req: Request, res: Response) {
        const {id} = req.params;
        const {groupMember} = req as RequestMember;
        const {fileNames} = req.body as {fileNames: string[]};
        try {
            if(!fileNames) throw BasicError('Informe o nome do anexo', 422);

            const media = new Attachment(Paths.media.attachments.groupPosts);

            await Promise.all(
                fileNames.map(async(fileName) => {
                    await model.group_attachments.deleteMany({where: {groupId: id.toString(), fileName: fileName, memberId: groupMember.id }});
                    await media.removeFile(fileName);
                }
            ));
            
            res.status(201).end();
            
        } catch(err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

}

export default GroupAttachments;