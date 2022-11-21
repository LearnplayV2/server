import type { Request, Response } from "express";
import Mail from "../Mail";

class Controller {
    greetings(req: Request, res: Response) {
        res.send('Olá mundo!');
    }

    debug(req: Request, res: Response) {
        const mail = new Mail();
        mail.send({to: process.env.SMTP_EMAIL ?? '', body: 'Olá mundo!', subject: 'Teste'});
        res.status(201).end();
    }
}

export default new Controller();