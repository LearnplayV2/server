import type { Request, Response } from "express";

class Controller {
    greetings(req: Request, res: Response) {
        res.send('Olá mundo!');
    }
}

export default new Controller();