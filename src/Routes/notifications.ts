import { Router } from "express";
import Controller from '../Controllers/user'
import ProtectedRoute from "../Middleware/ProtectedRoute";

const router = Router();

router.get('/notifications', ProtectedRoute, Controller.getNotifications);
router.get('/notification/:id', ProtectedRoute, Controller.getNotification);
router.put('/notification/toggle/:id', ProtectedRoute, Controller.toggleNotification);
router.put('/notification/makeAllRead', ProtectedRoute, Controller.makeAllNotificationRead);

export default router;