import type { Request, Response } from 'express';
import { RequestError } from 'request-error';
import Model from '../Models/groups';
import type { RequestGroup } from '../Types/groups';
import type { RequestUser } from '../Types/user';

class Controller {
    public async getAll(req: RequestGroup, res: Response) {
        try {
            const page = parseInt(req.params.page);
            const request = await Model.getAll({ page });

            res.json(request);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    public async create(req: RequestUser, res: Response) {
        const { title, visibility, description } = req.body;
        try {

            if(title.length > 31) throw RequestError('O título deve conter no máximo 31 caracteres');
            if(title.length < 4) throw RequestError('O título deve conter no mínimo 4 caracteres');
            if(description.length > 400) throw RequestError('A descrição deve conter no máximo 400 caracteres');

            const request = await Model.create({
                title,
                userId: req.userLoggedIn.uuid!,
                visibility: visibility,
                description,
            });

            res.json({ message: 'Grupo criado com sucesso!' });
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    public async delete(req: RequestUser, res: Response) {
        const { id } = req.params;
        try {
            const request = await Model.delete({
                id,
                userId: req.userLoggedIn.uuid!,
            });

            res.json({ message: 'Grupo deletado com sucesso!' });
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }

    public async myGroups(req: RequestUser, res: Response) {
        try {
            const page = parseInt(req.params.page);
            const response = await Model.myGroups({page, userId: req.userLoggedIn.uuid!, filter: req.params.filter});

            res.json(response);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
}

export default new Controller();
