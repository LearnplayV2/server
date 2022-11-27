import { Router } from "express";
import ProtectedRoute from "../Middleware/ProtectedRoute";
import Controller from '../Controllers/groups';
import StaffProtectedRoute from "../Middleware/group/StaffProtectedRoute";
import MemberProtectedRoute from "../Middleware/group/MemberProtectedRoute";

const router = Router();

router.get('/', ProtectedRoute, Controller.getAll);

// get group by id
router.get('/:id', [ProtectedRoute, MemberProtectedRoute], Controller.groupById);

// add link into grupo
router.post('/add/link', [ProtectedRoute, StaffProtectedRoute], Controller.addLinks);

// create new group
router.post('/new', ProtectedRoute, Controller.create);

// delete group
router.delete('/id/:id', ProtectedRoute, Controller.delete);

// get my groups
router.get('/my/page/:page/:filter?', ProtectedRoute, Controller.myGroups);

export default router;