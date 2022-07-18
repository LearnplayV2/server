import { Router } from "express";
import ProtectedRoute from "../Middleware/ProtectedRoute";
import Controller from '../Controllers/groups';

const router = Router();

router.get('/', ProtectedRoute, Controller.getAll);
router.post('/new', ProtectedRoute, Controller.create);

export default router;