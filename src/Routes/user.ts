import { Router } from "express";
import Controller from '../Controllers/user'
import ProtectedRoute from "../Middleware/ProtectedRoute";

const router = Router();

router.post('/register', Controller.create);
router.post('/login', Controller.login);
router.get('/refresh', ProtectedRoute, Controller.refresh);
router.post('/set-profile-picture', ProtectedRoute, Controller.setProfilePicture);
router.get('/get-profile-picture/:uuid', Controller.getProfilePicture);
router.get('/profile/:uuid', ProtectedRoute, Controller.getProfile);
router.get('/members', ProtectedRoute, Controller.getMembers);
router.get('/notifications', ProtectedRoute, Controller.getNotifications);

export default router;