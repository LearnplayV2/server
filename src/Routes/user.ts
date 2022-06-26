import { Router } from "express";
import Controller from '../Controllers/user'
import ProtectedRoute from "../Middleware/ProtectedRoute";

const router = Router();

router.post('/register', Controller.create);
router.post('/login', Controller.login);
router.get('/refresh', ProtectedRoute, Controller.refresh);


export default router;