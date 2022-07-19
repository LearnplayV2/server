import type { Response } from 'express';
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
            const response = await Model.myGroups({page, userId: req.userLoggedIn.uuid!});

            res.json(response);
        } catch (err: any) {
            res.status(err?.status ?? 500).json(err);
        }
    }
}

export default new Controller();
