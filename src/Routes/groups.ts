import { Router } from "express";
import ProtectedRoute from "../Middleware/ProtectedRoute";
import Controller from '../Controllers/groups';

const router = Router();

router.get('/', ProtectedRoute, Controller.getAll);
router.get('/:id', ProtectedRoute, Controller.groupById);
router.post('/new', ProtectedRoute, Controller.create);
router.delete('/id/:id', ProtectedRoute, Controller.delete);
router.get('/my/page/:page/:filter?', ProtectedRoute, Controller.myGroups);

export default router;