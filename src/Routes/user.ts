import { Router } from "express";
import Controller from '../Controllers/user'

const router = Router();

router.post('/register', Controller.create);
router.post('/login', Controller.login);


export default router;