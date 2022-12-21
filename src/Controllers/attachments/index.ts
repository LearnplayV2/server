import { Request, Response } from "express";
import Attachment from "../../class/attachment";
import { BasicError } from "../../Utils/basicError";

class AttachmentsController {

    static async show(req: Request, res: Response) {
        try {
            const {file, path, data} = req.query as {file: string, path: string, data?: string};
            if(!file) throw BasicError('Informe o título do anexo', 422);

            const attachments = new Attachment(path);

            let attachment = 'Finding attachment...';

            if(!data || data == 'data') {
                attachment = await attachments.getBase64File(file);
                if(!attachment) throw BasicError('Anexo não encontrado', 404);
                return res.send(attachment);
            } else if(attachments.fileExists(file)) {
                throw BasicError('to do direct file', 404);
            }

            throw BasicError('Anexo não encontrado', 404);
            
        } catch(err) {
            console.log(err);
            res.status(err?.status ?? 500).json(err);
        }
    }

}

export default AttachmentsController;