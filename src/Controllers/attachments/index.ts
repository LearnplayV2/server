import { Request, Response } from "express";
import Attachment from "../../class/attachment";
import { BasicError } from "../../Utils/basicError";

class AttachmentsController {

    static async show(req: Request, res: Response) {
        try {
            const {file, path} = req.query as {file: string, path: string};
            if(!file) throw BasicError('Informe o título do anexo', 422);

            const attachments = new Attachment(path);
            const data = await attachments.getBase64File(file);

            if(!data) throw BasicError('Anexo não encontrado', 404);

            res.send(data);
            
        } catch(err) {
            console.log(err);
            res.status(err?.status ?? 500).json(err);
        }
    }

}

export default AttachmentsController;